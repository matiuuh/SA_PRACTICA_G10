// frontend/src/services/localidades.service.ts

import api from './api';
import type { 
  CineBackend, 
  CiudadBackend, 
  CreateCineRequest, 
  UpdateCineRequest 
} from '../types/admin.types';

const BASE_URL = '/api/localidades';
const ADMIN_BASE_URL = '/api/admin/localidades';

export const localidadesService = {
  // Obtener todos los cines
  async getCines(): Promise<CineBackend[]> {
    const response = await api.get(`${BASE_URL}/cines`);
    return response.data;
  },

  // Obtener un cine por ID
  async getCineById(id: string): Promise<CineBackend> {
    const response = await api.get(`${BASE_URL}/cines/${id}`);
    return response.data;
  },

  // Obtener cines por ciudad (NECESARIO para PanelAdmin)
  async getCinesByCiudad(idCiudad: string): Promise<CineBackend[]> {
    const response = await api.get(`${BASE_URL}/ciudades/${idCiudad}/cines`);
    return response.data;
  },

  // Obtener todas las ciudades
  async getCiudades(): Promise<CiudadBackend[]> {
    const response = await api.get(`${BASE_URL}/ciudades`);
    return response.data;
  },

  // Crear nueva ciudad (NECESARIO para PanelAdmin)
  async createCiudad(data: { nombre: string }): Promise<CiudadBackend> {
    const response = await api.post(`${BASE_URL}/ciudades`, data);
    return response.data;
  },

  // Crear nuevo cine
  async createCine(data: CreateCineRequest): Promise<CineBackend> {
    const response = await api.post(`${BASE_URL}/cines`, data);
    return response.data;
  },

  // Actualizar cine
  async updateCine(id: string, data: UpdateCineRequest): Promise<CineBackend> {
    const response = await api.patch(`${ADMIN_BASE_URL}/cines/${id}`, data);
    return response.data;
  },

  // Eliminar cine
  async deleteCine(id: string): Promise<void> {
    await api.delete(`${ADMIN_BASE_URL}/cines/${id}`);
  },
};
