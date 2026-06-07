import { api, endpoints } from './api';
import type {
  Ciudad,
  Cine,
  Sala,
  CreateCiudadRequest,
  CreateCineRequest,
  CreateSalaRequest,
} from '../types/localidades.types';

const base = endpoints.localidades;
const admin = `${endpoints.localidades.replace('/api/localidades', '/api/admin/localidades')}`;

class LocalidadesService {
  // ─── Ciudades (público) ──────────────────────────────────────────
  async getCiudades(): Promise<Ciudad[]> {
    const res = await api.get<Ciudad[]>(`${base}/ciudades`);
    return res.data;
  }

  async getCiudadById(id: string): Promise<Ciudad> {
    const res = await api.get<Ciudad>(`${base}/ciudades/${id}`);
    return res.data;
  }

  // ─── Cines (público) ─────────────────────────────────────────────
  async getCines(): Promise<Cine[]> {
    const res = await api.get<Cine[]>(`${base}/cines`);
    return res.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const res = await api.get<Cine[]>(`${base}/ciudades/${idCiudad}/cines`);
    return res.data;
  }

  // ─── Salas (público) ─────────────────────────────────────────────
  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const res = await api.get<Sala[]>(`${base}/cines/${idCine}/salas`);
    return res.data;
  }

  // ─── Admin: Ciudades ─────────────────────────────────────────────
  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const res = await api.post<Ciudad>(`${admin}/ciudades`, data);
    return res.data;
  }

  async updateCiudad(id: string, data: Partial<CreateCiudadRequest>): Promise<Ciudad> {
    const res = await api.patch<Ciudad>(`${admin}/ciudades/${id}`, data);
    return res.data;
  }

  async deleteCiudad(id: string): Promise<void> {
    await api.delete(`${admin}/ciudades/${id}`);
  }

  // ─── Admin: Cines ────────────────────────────────────────────────
  async createCine(data: CreateCineRequest): Promise<Cine> {
    const res = await api.post<Cine>(`${admin}/cines`, data);
    return res.data;
  }

  async updateCine(id: string, data: Partial<CreateCineRequest>): Promise<Cine> {
    const res = await api.patch<Cine>(`${admin}/cines/${id}`, data);
    return res.data;
  }

  async deleteCine(id: string): Promise<void> {
    await api.delete(`${admin}/cines/${id}`);
  }

  // ─── Admin: Salas ────────────────────────────────────────────────
  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const res = await api.post<Sala>(`${admin}/salas`, data);
    return res.data;
  }

  async updateSala(id: string, data: Partial<CreateSalaRequest>): Promise<Sala> {
    const res = await api.patch<Sala>(`${admin}/salas/${id}`, data);
    return res.data;
  }

  async deleteSala(id: string): Promise<void> {
    await api.delete(`${admin}/salas/${id}`);
  }
}

export const localidadesService = new LocalidadesService();
