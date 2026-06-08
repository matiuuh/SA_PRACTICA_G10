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
  async getCiudades(): Promise<Ciudad[]> {
    const response = await api.get<Ciudad[]>(`${base}/ciudades`);
    return response.data;
  }

  async getCiudadById(id: string): Promise<Ciudad> {
    const response = await api.get<Ciudad>(`${base}/ciudades/${id}`);
    return response.data;
  }

  async getCines(): Promise<Cine[]> {
    const response = await api.get<Cine[]>(`${base}/cines`);
    return response.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const response = await api.get<Cine[]>(`${base}/ciudades/${idCiudad}/cines`);
    return response.data;
  }

  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const response = await api.get<Sala[]>(`${base}/cines/${idCine}/salas`);
    return response.data;
  }

  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const response = await api.post<Ciudad>(`${base}/ciudades`, data);
    return response.data;
  }

  async createCine(data: CreateCineRequest): Promise<Cine> {
    const response = await api.post<Cine>(`${base}/cines`, data);
    return response.data;
  }

  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const response = await api.post<Sala>(`${base}/salas`, data);
    return response.data;
  }
}

export const localidadesService = new LocalidadesService();
