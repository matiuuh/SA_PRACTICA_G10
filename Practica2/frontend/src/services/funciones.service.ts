import { api, endpoints } from './api';
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
} from '../types/funciones.types';

class FuncionesService {
  async getPeliculas(tipoCartelera?: string): Promise<Pelicula[]> {
    const response = await api.get<Pelicula[]>(`${endpoints.funciones}/peliculas`, {
      params: tipoCartelera ? { tipo_cartelera: tipoCartelera } : undefined,
    });

    return response.data;
  }

  async getPelicula(id: string): Promise<Pelicula> {
    const response = await api.get<Pelicula>(`${endpoints.funciones}/peliculas/${id}`);
    return response.data;
  }

  async createPelicula(data: CreatePeliculaRequest): Promise<Pelicula> {
    const response = await api.post<Pelicula>(`${endpoints.funciones}/peliculas`, data);
    return response.data;
  }

  async updatePelicula(id: string, data: UpdatePeliculaRequest): Promise<Pelicula> {
    const response = await api.put<Pelicula>(`${endpoints.funciones}/peliculas/${id}`, data);
    return response.data;
  }

  async deletePelicula(id: string): Promise<void> {
    await api.delete(`${endpoints.funciones}/peliculas/${id}`);
  }

  async getFunciones(filters?: FuncionesFilter): Promise<Funcion[]> {
    const response = await api.get<Funcion[]>(endpoints.funciones, { params: filters });
    return response.data;
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

  async getCategorias(): Promise<Categoria[]> {
    const response = await api.get<Categoria[]>(`${endpoints.funciones}/categorias`);
    return response.data;
  }

  async createCategoria(nombre: string): Promise<Categoria> {
    const response = await api.post<Categoria>(`${endpoints.funciones}/categorias`, { nombre });
    return response.data;
  }

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const response = await api.get<TipoCartelera[]>(`${endpoints.funciones}/tipo-cartelera`);
    return response.data;
  }

  async createTipoCartelera(nombre: string): Promise<TipoCartelera> {
    const response = await api.post<TipoCartelera>(`${endpoints.funciones}/tipo-cartelera`, { nombre });
    return response.data;
  }

  async getSalas(): Promise<SalaFuncion[]> {
    const response = await api.get<SalaFuncion[]>(`${endpoints.funciones}/salas`);
    return response.data;
  }

  async getSalasByCine(idCine: string): Promise<SalaFuncion[]> {
    const response = await api.get<SalaFuncion[]>(`${endpoints.funciones}/salas/cine/${idCine}`);
    return response.data;
  }

  async createSala(data: CreateSalaFuncionRequest): Promise<SalaFuncion> {
    const response = await api.post<SalaFuncion>(`${endpoints.funciones}/salas`, data);
    return response.data;
  }
}

export const funcionesService = new FuncionesService();
