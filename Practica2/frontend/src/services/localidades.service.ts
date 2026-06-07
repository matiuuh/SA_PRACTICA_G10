import axios from 'axios';
import type {
  Ciudad,
  Cine,
  Sala,
  CreateCiudadRequest,
  CreateCineRequest,
  CreateSalaRequest,
} from '../types/localidades.types';

const LOCALIDADES_URL = import.meta.env.VITE_LOCALIDADES_URL || 'http://localhost:3002';

const localidadesApi = axios.create({
  baseURL: `${LOCALIDADES_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

localidadesApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

class LocalidadesService {
  async getCiudades(): Promise<Ciudad[]> {
    const res = await localidadesApi.get<Ciudad[]>('/localidades/ciudades');
    return res.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const res = await localidadesApi.get<Cine[]>(`/localidades/ciudades/${idCiudad}/cines`);
    return res.data;
  }

  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const res = await localidadesApi.get<Sala[]>(`/localidades/cines/${idCine}/salas`);
    return res.data;
  }

  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const res = await localidadesApi.post<Ciudad>('/localidades/ciudades', data);
    return res.data;
  }

  async createCine(data: CreateCineRequest): Promise<Cine> {
    const res = await localidadesApi.post<Cine>('/localidades/cines', data);
    return res.data;
  }

  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const res = await localidadesApi.post<Sala>('/localidades/salas', data);
    return res.data;
  }
}

export const localidadesService = new LocalidadesService();
