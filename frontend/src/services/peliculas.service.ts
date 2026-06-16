import { api } from './api';
import type {
  Categoria,
  CreatePeliculaDto,
  PaginatedPeliculas,
  Pelicula,
  PeliculasCsvImportResult,
  PeliculasQuery,
  TipoCartelera,
} from '../types/admin.types';

interface ApiCatalogItem {
  id: string;
  nombre: string;
}

interface ApiPelicula {
  id: string;
  titulo: string;
  sinopsis: string | null;
  duracion_minutos: number | null;
  poster_url: string | null;
  activa: boolean;
  categoria: ApiCatalogItem;
  tipoCartelera: ApiCatalogItem;
}

interface ApiPaginatedPeliculas {
  data: ApiPelicula[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const mapCategoria = (item: ApiCatalogItem): Categoria => ({
  id_categoria: item.id,
  nombre: item.nombre,
});

const mapTipoCartelera = (item: ApiCatalogItem): TipoCartelera => ({
  id_tipo_cartelera: item.id,
  nombre: item.nombre,
});

const allowedTipoCarteleraNames = new Set(['estreno', 'preventa', 'reestreno']);

const isAllowedTipoCartelera = (item: ApiCatalogItem) =>
  allowedTipoCarteleraNames.has(item.nombre.trim().toLowerCase());

const mapPelicula = (item: ApiPelicula): Pelicula => ({
  id_pelicula: item.id,
  titulo: item.titulo,
  sinopsis: item.sinopsis,
  duracion_minutos: item.duracion_minutos,
  poster_url: item.poster_url,
  activa: item.activa,
  categoria: mapCategoria(item.categoria),
  tipoCartelera: mapTipoCartelera(item.tipoCartelera),
});

class PeliculasService {
  async getCategorias(): Promise<Categoria[]> {
    const response = await api.get<ApiCatalogItem[]>('/api/categorias');
    return response.data.map(mapCategoria);
  }

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const response = await api.get<ApiCatalogItem[]>('/api/tipo-cartelera');
    return response.data.filter(isAllowedTipoCartelera).map(mapTipoCartelera);
  }

  async getPeliculas(params?: PeliculasQuery): Promise<Pelicula[]> {
    const response = await api.get<ApiPelicula[] | ApiPaginatedPeliculas>('/api/peliculas', {
      params,
    });

    if (Array.isArray(response.data)) {
      return response.data.map(mapPelicula);
    }

    return response.data.data.map(mapPelicula);
  }

  async getPeliculasPaginated(params: PeliculasQuery = {}): Promise<PaginatedPeliculas> {
    const response = await api.get<ApiPaginatedPeliculas>('/api/peliculas', {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
        search: params.search || undefined,
        id_categoria: params.id_categoria,
        id_tipo_cartelera: params.id_tipo_cartelera,
        tipo_cartelera: params.tipo_cartelera,
        activa: params.activa,
      },
    });

    return {
      data: response.data.data.map(mapPelicula),
      meta: response.data.meta,
    };
  }

  async getAllPeliculas(): Promise<Pelicula[]> {
    const firstPage = await this.getPeliculasPaginated({ page: 1, limit: 10 });
    const peliculas = [...firstPage.data];

    for (let page = 2; page <= firstPage.meta.totalPages; page += 1) {
      const nextPage = await this.getPeliculasPaginated({ page, limit: 10 });
      peliculas.push(...nextPage.data);
    }

    return peliculas;
  }

  async createPelicula(data: CreatePeliculaDto): Promise<Pelicula> {
    const response = await api.post<ApiPelicula>('/api/peliculas', data);
    return mapPelicula(response.data);
  }

  async updatePelicula(id: string, data: Partial<CreatePeliculaDto>): Promise<Pelicula> {
    const response = await api.put<ApiPelicula>(`/api/peliculas/${id}`, data);
    return mapPelicula(response.data);
  }

  async deletePelicula(id: string): Promise<void> {
    await api.delete(`/api/peliculas/${id}`);
  }

  async importCsv(file: File): Promise<PeliculasCsvImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<PeliculasCsvImportResult>('/api/peliculas/carga-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    return response.data;
  }
}

export const peliculasService = new PeliculasService();
