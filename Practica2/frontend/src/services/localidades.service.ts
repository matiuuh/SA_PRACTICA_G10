import { api, endpoints } from './api';
import type {
  Ciudad,
  Cine,
  Sala,
  CreateCiudadRequest,
  CreateCineRequest,
  CreateSalaRequest,
} from '../types/localidades.types';

class LocalidadesService {
  async getCiudades(): Promise<Ciudad[]> {
    const response = await api.get<Ciudad[]>(`${endpoints.localidades}/ciudades`);
    return response.data;
  }

  async getCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    const response = await api.get<Cine[]>(`${endpoints.localidades}/ciudades/${idCiudad}/cines`);
    return response.data;
  }

  async getSalasByCine(idCine: string): Promise<Sala[]> {
    const response = await api.get<Sala[]>(`${endpoints.localidades}/cines/${idCine}/salas`);
    return response.data;
  }

  async createCiudad(data: CreateCiudadRequest): Promise<Ciudad> {
    const response = await api.post<Ciudad>(`${endpoints.localidades}/ciudades`, data);
    return response.data;
  }

  async createCine(data: CreateCineRequest): Promise<Cine> {
    const response = await api.post<Cine>(`${endpoints.localidades}/cines`, data);
    return response.data;
  }

  async createSala(data: CreateSalaRequest): Promise<Sala> {
    const response = await api.post<Sala>(`${endpoints.localidades}/salas`, data);
    return response.data;
  }
}

export const localidadesService = new LocalidadesService();
