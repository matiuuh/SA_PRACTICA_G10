import { api, endpoints } from './api';
import type {
  CreateIncidenciaPayload,
  EstadoIncidencia,
  Incidencia,
  PaginatedIncidencias,
} from '../types/incidencias.types';

class IncidenciasService {
  async create(payload: CreateIncidenciaPayload): Promise<Incidencia> {
    const response = await api.post<Incidencia>(
      `${endpoints.reservas}/incidencias`,
      payload,
    );
    return response.data;
  }

  async getMine(page = 1, limit = 10): Promise<PaginatedIncidencias> {
    const response = await api.get<PaginatedIncidencias>(
      `${endpoints.reservas}/mis-incidencias`,
      { params: { page, limit } },
    );
    return response.data;
  }

  async getAdmin(
    page = 1,
    limit = 10,
    estado?: EstadoIncidencia,
  ): Promise<PaginatedIncidencias> {
    const response = await api.get<PaginatedIncidencias>(
      `${endpoints.reservas}/admin/incidencias`,
      { params: { page, limit, ...(estado ? { estado } : {}) } },
    );
    return response.data;
  }

  async respond(id: string, respuesta: string): Promise<Incidencia> {
    const response = await api.patch<Incidencia>(
      `${endpoints.reservas}/admin/incidencias/${id}/responder`,
      { respuesta },
    );
    return response.data;
  }
}

export const incidenciasService = new IncidenciasService();
