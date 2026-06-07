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
} from '../types/funciones.types';

const FUNCIONES_URL = import.meta.env.VITE_FUNCIONES_URL || 'http://localhost:3003';

const funcionesApi = axios.create({
  baseURL: `${FUNCIONES_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

funcionesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

class FuncionesService {
  // --- Peliculas ---

  async getPeliculas(tipoCartelera?: string): Promise<Pelicula[]> {
    const res = await funcionesApi.get<Pelicula[]>('/peliculas', {
      params: tipoCartelera ? { tipo_cartelera: tipoCartelera } : undefined,
    });
    return res.data;
  }

  async getPelicula(id: string): Promise<Pelicula> {
    const res = await funcionesApi.get<Pelicula>(`/peliculas/${id}`);
    return res.data;
  }

  async createPelicula(data: CreatePeliculaRequest): Promise<Pelicula> {
    const res = await funcionesApi.post<Pelicula>('/peliculas', data);
    return res.data;
  }

  async updatePelicula(id: string, data: UpdatePeliculaRequest): Promise<Pelicula> {
    const res = await funcionesApi.put<Pelicula>(`/peliculas/${id}`, data);
    return res.data;
  }

  async deletePelicula(id: string): Promise<void> {
    await funcionesApi.delete(`/peliculas/${id}`);
  }

  // --- Funciones ---

  async getFunciones(filters?: FuncionesFilter): Promise<Funcion[]> {
    const res = await funcionesApi.get<Funcion[]>('/funciones', { params: filters });
    return res.data;
  }

  async getFuncion(id: string): Promise<Funcion> {
    const res = await funcionesApi.get<Funcion>(`/funciones/${id}`);
    return res.data;
  }

  async createFuncion(data: CreateFuncionRequest): Promise<Funcion> {
    const res = await funcionesApi.post<Funcion>('/funciones', data);
    return res.data;
  }

  async updateFuncion(id: string, data: UpdateFuncionRequest): Promise<Funcion> {
    const res = await funcionesApi.put<Funcion>(`/funciones/${id}`, data);
    return res.data;
  }

  // --- Categorias ---

  async getCategorias(): Promise<Categoria[]> {
    const res = await funcionesApi.get<Categoria[]>('/categorias');
    return res.data;
  }

  async createCategoria(nombre: string): Promise<Categoria> {
    const res = await funcionesApi.post<Categoria>('/categorias', { nombre });
    return res.data;
  }

  // --- Tipo Cartelera ---

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const res = await funcionesApi.get<TipoCartelera[]>('/tipo-cartelera');
    return res.data;
  }

  async createTipoCartelera(nombre: string): Promise<TipoCartelera> {
    const res = await funcionesApi.post<TipoCartelera>('/tipo-cartelera', { nombre });
    return res.data;
  }

  // --- Salas (del servicio de funciones) ---

  async getSalas(): Promise<SalaFuncion[]> {
    const res = await funcionesApi.get<SalaFuncion[]>('/salas');
    return res.data;
  }

  async getSalasByCine(idCine: string): Promise<SalaFuncion[]> {
    const res = await funcionesApi.get<SalaFuncion[]>(`/salas/cine/${idCine}`);
    return res.data;
  }

  async createSala(data: CreateSalaFuncionRequest): Promise<SalaFuncion> {
    const res = await funcionesApi.post<SalaFuncion>('/salas', data);
    return res.data;
  }
}

export const funcionesService = new FuncionesService();
