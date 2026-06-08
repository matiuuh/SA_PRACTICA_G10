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

class LocalidadesService {
  // ─── Ciudades ────────────────────────────────────────────────────
  async getCiudades(): Promise<Ciudad[]> {
    const res = await api.get<Ciudad[]>(`${base}/ciudades`);
    return res.data;
  }

  async getCiudadById(id: string): Promise<Ciudad> {
    const res = await api.get<Ciudad>(`${base}/ciudades/${id}`);
    return res.data;
  }

  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const res = await api.post<Ciudad>(`${base}/ciudades`, data);
    return res.data;
  }

  // ─── Cines ───────────────────────────────────────────────────────
  async getCines(): Promise<Cine[]> {
    const res = await api.get<Cine[]>(`${base}/cines`);
    return res.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const res = await api.get<Cine[]>(`${base}/ciudades/${idCiudad}/cines`);
    return res.data;
  }

  async createCine(data: CreateCineRequest): Promise<Cine> {
    const res = await api.post<Cine>(`${base}/cines`, data);
    return res.data;
  }

  // ─── Salas ───────────────────────────────────────────────────────
  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const res = await api.get<Sala[]>(`${base}/cines/${idCine}/salas`);
    return res.data;
  }

  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const res = await api.post<Sala>(`${base}/salas`, data);
    return res.data;
  }
}

export const localidadesService = new LocalidadesService();
