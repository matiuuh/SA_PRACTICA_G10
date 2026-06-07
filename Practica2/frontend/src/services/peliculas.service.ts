import axios from 'axios';
import type {
  Categoria,
  CreatePeliculaDto,
  Pelicula,
  TipoCartelera,
} from '../types/admin.types';

const FUNCIONES_URL = import.meta.env.VITE_FUNCIONES_URL || 'http://localhost:3003';

const peliculasApi = axios.create({
  baseURL: `${FUNCIONES_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

peliculasApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

class PeliculasService {
  async getCategorias(): Promise<Categoria[]> {
    const response = await peliculasApi.get<{ id: string; nombre: string }[]>('/categorias');

    return response.data.map((item) => ({
      id_categoria: item.id,
      nombre: item.nombre,
    }));
  }

  async getTiposCartelera(): Promise<TipoCartelera[]> {
    const response = await peliculasApi.get<{ id: string; nombre: string }[]>('/tipo-cartelera');

    return response.data.map((item) => ({
      id_tipo_cartelera: item.id,
      nombre: item.nombre,
    }));
  }

  async getPeliculas(): Promise<Pelicula[]> {
    const response = await peliculasApi.get<Pelicula[]>('/peliculas');
    return response.data;
  }

  async createPelicula(data: CreatePeliculaDto): Promise<Pelicula> {
    const response = await peliculasApi.post<Pelicula>('/peliculas', data);
    return response.data;
  }

  async updatePelicula(id: string, data: Partial<CreatePeliculaDto>): Promise<Pelicula> {
    const response = await peliculasApi.put<Pelicula>(`/peliculas/${id}`, data);
    return response.data;
  }

  async deletePelicula(id: string): Promise<void> {
    await peliculasApi.delete(`/peliculas/${id}`);
  }
}

export const peliculasService = new PeliculasService();
