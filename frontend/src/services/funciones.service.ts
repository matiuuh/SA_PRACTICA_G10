import { api, endpoints } from './api';
import axios from 'axios';
import type {
  Categoria,
  TipoCartelera,
  Pelicula,
  SalaFuncion,
  Funcion,
  CreatePeliculaRequest,
  UpdatePeliculaRequest,
  CreateFuncionRequest,
  UpdateFuncionRequest,
  CreateSalaFuncionRequest,
  FuncionesFilter,
  PaginatedFunciones,
  PaginatedSalas,
} from '../types/funciones.types';

const peliculasRoute = '/api/peliculas';
const categoriasRoute = '/api/categorias';
const tiposCarteleraRoute = '/api/tipo-cartelera';
const salasRoute = '/api/salas';
const allowedTipoCarteleraNames = new Set(['estreno', 'preventa', 'reestreno']);

interface ApiPaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class FuncionesService {
  async getPeliculas(tipoCartelera?: string): Promise<Pelicula[]> {
    const response = await api.get<Pelicula[] | ApiPaginatedResponse<Pelicula>>(peliculasRoute, {
      params: tipoCartelera ? { tipo_cartelera: tipoCartelera } : undefined,
    });

    return Array.isArray(response.data) ? response.data : response.data.data;
  }

  async getPelicula(id: string): Promise<Pelicula> {
    const response = await api.get<Pelicula>(`${peliculasRoute}/${id}`);
    return response.data;
  }

  async createPelicula(data: CreatePeliculaRequest): Promise<Pelicula> {
    const response = await api.post<Pelicula>(peliculasRoute, data);
    return response.data;
  }

  async updatePelicula(id: string, data: UpdatePeliculaRequest): Promise<Pelicula> {
    const response = await api.put<Pelicula>(`${peliculasRoute}/${id}`, data);
    return response.data;
  }

  async deletePelicula(id: string): Promise<void> {
    await api.delete(`${peliculasRoute}/${id}`);
  }

  async getFunciones(filters?: FuncionesFilter): Promise<Funcion[]> {
    try {
      const response = await api.get<Funcion[]>(endpoints.funciones, { params: filters });
      return response.data;
    } catch (error) {
      if (!filters?.cine || !axios.isAxiosError(error) || error.response?.status !== 500) {
        throw error;
      }

      const fallbackResponse = await api.get<Funcion[]>(endpoints.funciones);

      return fallbackResponse.data.filter((funcion) => {
        if (funcion.sala.id_cine_externo !== filters.cine) {
          return false;
        }

        if (filters.sala && funcion.sala.id !== filters.sala) {
          return false;
        }

        if (filters.pelicula && funcion.pelicula.id !== filters.pelicula) {
          return false;
        }

        return true;
      });
    }
  }

  async getFuncion(id: string): Promise<Funcion> {
    const response = await api.get<Funcion>(`${endpoints.funciones}/${id}`);
    return response.data;
  }

  async createFuncion(data: CreateFuncionRequest): Promise<Funcion> {
    const response = await api.post<Funcion>(endpoints.funciones, data);
    return response.data;
  }

  async updateFuncion(id: string, data: UpdateFuncionRequest): Promise<Funcion> {
    const response = await api.put<Funcion>(`${endpoints.funciones}/${id}`, data);
    return response.data;
  }

  async deleteFuncion(id: string): Promise<void> {
    await api.delete(`${endpoints.funciones}/${id}`);
  }

  async getCategorias(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>(categoriasRoute);
    return response.data;
  }

  async createCategoria(nombre: string): Promise<Categoria> {
    const response = await api.post<Categoria>(categoriasRoute, { nombre });
    return response.data;
  }

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const response = await api.get<TipoCartelera[]>(tiposCarteleraRoute);
    return response.data.filter((tipo) =>
      allowedTipoCarteleraNames.has(tipo.nombre.trim().toLowerCase()),
    );
  }

  async createTipoCartelera(nombre: string): Promise<TipoCartelera> {
    const response = await api.post<TipoCartelera>(tiposCarteleraRoute, { nombre });
    return response.data;
  }

  async getSalas(): Promise<SalaFuncion[]> {
    const response = await api.get<SalaFuncion[]>(salasRoute);
    return response.data;
  }

  async getCartelera(cine: string, page = 1, limit = 10, tipoCartelera?: string): Promise<PaginatedFunciones> {
    const response = await api.get<PaginatedFunciones>(`${endpoints.funciones}/cartelera`, {
      params: { cine, page, limit, ...(tipoCartelera ? { tipo_cartelera: tipoCartelera } : {}) },
    });
    return response.data;
  }

  async getFuncionesPaginated(params: { page?: number; limit?: number; cine?: string; sala?: string; pelicula?: string } = {}): Promise<PaginatedFunciones> {
    const response = await api.get<PaginatedFunciones>(`${endpoints.funciones}/paginated`, {
      params,
    });
    return response.data;
  }

  async getSalasPaginated(params: { page?: number; limit?: number; cine?: string; search?: string } = {}): Promise<PaginatedSalas> {
    const response = await api.get<PaginatedSalas>(`${salasRoute}/paginated`, {
      params,
    });
    return response.data;
  }

  async getSalasByCine(idCine: string): Promise<SalaFuncion[]> {
    const response = await api.get<SalaFuncion[]>(`${salasRoute}/cine/${idCine}`);
    return response.data;
  }

  async createSala(data: CreateSalaFuncionRequest): Promise<SalaFuncion> {
    const response = await api.post<SalaFuncion>(salasRoute, data);
    return response.data;
  }

  async updateSala(id: string, data: Partial<CreateSalaFuncionRequest>): Promise<SalaFuncion> {
    const response = await api.put<SalaFuncion>(`${salasRoute}/${id}`, data);
    return response.data;
  }

  async deleteSala(id: string): Promise<void> {
    await api.delete(`${salasRoute}/${id}`);
  }
}

export const funcionesService = new FuncionesService();
