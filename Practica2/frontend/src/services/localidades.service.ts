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
  // ─── Ciudades (público) ──────────────────────────────────────────
  async getCiudades(): Promise<Ciudad[]> {
    const res = await localidadesApi.get<Ciudad[]>('/localidades/ciudades');
    return res.data;
  }

  async getCiudadById(id: string): Promise<Ciudad> {
    const res = await localidadesApi.get<Ciudad>(`/localidades/ciudades/${id}`);
    return res.data;
  }

  // ─── Cines (público) ─────────────────────────────────────────────
  async getCines(): Promise<Cine[]> {
    const res = await localidadesApi.get<Cine[]>('/localidades/cines');
    return res.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const res = await localidadesApi.get<Cine[]>(`/localidades/ciudades/${idCiudad}/cines`);
    return res.data;
  }

  // ─── Salas (público) ─────────────────────────────────────────────
  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const res = await localidadesApi.get<Sala[]>(`/localidades/cines/${idCine}/salas`);
    return res.data;
  }

  // ─── Admin: Ciudades ─────────────────────────────────────────────
  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const res = await localidadesApi.post<Ciudad>('/admin/localidades/ciudades', data);
    return res.data;
  }

  async updateCiudad(id: string, data: Partial<CreateCiudadRequest>): Promise<Ciudad> {
    const res = await localidadesApi.patch<Ciudad>(`/admin/localidades/ciudades/${id}`, data);
    return res.data;
  }

  async deleteCiudad(id: string): Promise<void> {
    await localidadesApi.delete(`/admin/localidades/ciudades/${id}`);
  }

  // ─── Admin: Cines ────────────────────────────────────────────────
  async createCine(data: CreateCineRequest): Promise<Cine> {
    const res = await localidadesApi.post<Cine>('/admin/localidades/cines', data);
    return res.data;
  }

  async updateCine(id: string, data: Partial<CreateCineRequest>): Promise<Cine> {
    const res = await localidadesApi.patch<Cine>(`/admin/localidades/cines/${id}`, data);
    return res.data;
  }

  async deleteCine(id: string): Promise<void> {
    await localidadesApi.delete(`/admin/localidades/cines/${id}`);
  }

  // ─── Admin: Salas ────────────────────────────────────────────────
  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const res = await localidadesApi.post<Sala>('/admin/localidades/salas', data);
    return res.data;
  }

  async updateSala(id: string, data: Partial<CreateSalaRequest>): Promise<Sala> {
    const res = await localidadesApi.patch<Sala>(`/admin/localidades/salas/${id}`, data);
    return res.data;
  }

  async deleteSala(id: string): Promise<void> {
    await localidadesApi.delete(`/admin/localidades/salas/${id}`);
  }
}

export const localidadesService = new LocalidadesService();
