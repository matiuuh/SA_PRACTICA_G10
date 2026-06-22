// src/services/reservas.service.ts

import { api, endpoints } from './api';
import type {
  CheckoutPayload,
  CreateAsientoPayload,
  Reserva,
  ReservaAsiento,
} from '../types/reservas.types';
import type { 
  BoletoValidacion, 
  AdminBusquedaBoletosFiltros, 
  AdminBusquedaBoletosResultado 
} from '../types/admin.types';

class ReservasService {
  async getAsientosByFuncion(funcionId: string): Promise<ReservaAsiento[]> {
    const response = await api.get<ReservaAsiento[]>(`${endpoints.reservas}/funciones/${funcionId}/asientos`);
    return response.data;
  }

  async createAsiento(data: CreateAsientoPayload): Promise<ReservaAsiento> {
    const response = await api.post<ReservaAsiento>(`${endpoints.reservas}/asientos`, data);
    return response.data;
  }

  async createCheckout(data: CheckoutPayload): Promise<Reserva> {
    const response = await api.post<Reserva>(`${endpoints.reservas}/checkout`, data);
    return response.data;
  }

  async getReserva(reservaId: string): Promise<Reserva> {
    const response = await api.get<Reserva>(`${endpoints.reservas}/${reservaId}`);
    return response.data;
  }

  // ========== NUEVOS MÉTODOS PARA VALIDACIÓN ==========

  /**
   * Valida un boleto por código QR (escaneo)
   */
  async validarBoleto(codigo: string): Promise<BoletoValidacion> {
    const response = await api.post<BoletoValidacion>(
      `${endpoints.reservas}/boletos/validar`,
      { codigo }
    );
    return response.data;
  }

  /**
   * Valida un boleto manualmente por ID (administrador)
   */
  async validarBoletoManual(id: string): Promise<BoletoValidacion> {
    const response = await api.post<BoletoValidacion>(
      `${endpoints.reservas}/boletos/${id}/validar-manualmente`
    );
    return response.data;
  }

  /**
   * Búsqueda avanzada de boletos para administradores
   */
  async buscarBoletosAdmin(filtros: AdminBusquedaBoletosFiltros): Promise<AdminBusquedaBoletosResultado> {
    const params: Record<string, string | number> = {};

    if (filtros.identificador) params.identificador = filtros.identificador;
    if (filtros.pelicula) params.pelicula = filtros.pelicula;
    if (filtros.fechaDesde) params.fechaDesde = filtros.fechaDesde;
    if (filtros.fechaHasta) params.fechaHasta = filtros.fechaHasta;
    if (filtros.estado) params.estado = filtros.estado;
    if (filtros.page) params.page = filtros.page;
    if (filtros.limit) params.limit = filtros.limit;

    const response = await api.get<AdminBusquedaBoletosResultado>(
      `${endpoints.reservas}/admin/boletos`,
      { params }
    );
    return response.data;
  }
}

export const reservasService = new ReservasService();