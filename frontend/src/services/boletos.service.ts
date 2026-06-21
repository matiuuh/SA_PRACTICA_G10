// src/services/boletos.service.ts

import { api, endpoints } from './api';
import type { PaginatedTicketHistory, HistorialFiltros, TicketHistoryItem } from '../types/boletos.types';

class BoletosService {
  async getHistorial(
    page: number = 1,
    limit: number = 10,
    filtros?: Partial<HistorialFiltros>
  ): Promise<PaginatedTicketHistory> {
    const params: Record<string, string | number> = {
      page,
      limit: Math.min(limit, 50),
    };

    if (filtros?.busqueda) {
      params.identificador = filtros.busqueda;
    }

    if (filtros?.fechaInicio) {
      params.fechaDesde = filtros.fechaInicio;
    }

    if (filtros?.fechaFin) {
      params.fechaHasta = filtros.fechaFin;
    }

    if (filtros?.estado && filtros.estado !== 'todos') {
      params.estado = filtros.estado;
    }

    // CAMBIO: usar 'mis-boletos' en lugar de 'historial'
    const response = await api.get<PaginatedTicketHistory>(
      `${endpoints.reservas}/mis-boletos`,
      { params }
    );

    return response.data;
  }

  async descargarBoleto(ticketId: string): Promise<void> {
    try {
      const response = await api.get(
        `${endpoints.reservas}/boletos/${ticketId}/descargar`,
        {
          responseType: 'blob',
        }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      window.open(url, '_blank');

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error al descargar el boleto:', error);
      throw error;
    }
  }

  async getBoleto(ticketId: string): Promise<TicketHistoryItem> {
    const response = await api.get<TicketHistoryItem>(
      `${endpoints.reservas}/boletos/${ticketId}`
    );
    return response.data;
  }
}

export const boletosService = new BoletosService();