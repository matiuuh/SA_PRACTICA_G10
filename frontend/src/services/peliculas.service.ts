import { api } from './api';
import type { Categoria, CreatePeliculaDto, Pelicula, TipoCartelera } from '../types/admin.types';

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

const mapCategoria = (item: ApiCatalogItem): Categoria => ({
  id_categoria: item.id,
  nombre: item.nombre,
});

const mapTipoCartelera = (item: ApiCatalogItem): TipoCartelera => ({
  id_tipo_cartelera: item.id,
  nombre: item.nombre,
});

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
    return response.data.map(mapTipoCartelera);
  }

  async getPeliculas(): Promise<Pelicula[]> {
    const response = await api.get<ApiPelicula[]>('/api/peliculas');
    return response.data.map(mapPelicula);
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
}

export const peliculasService = new PeliculasService();
