// src/services/boletos.service.ts

import { api, endpoints } from './api';
import type { PaginatedTicketHistory, HistorialFiltros, TicketHistoryItem } from '../types/boletos.types';

// Necesitamos la URL base para fetch
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:3006';

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

    const response = await api.get<PaginatedTicketHistory>(
      `${endpoints.reservas}/mis-boletos`,
      { params }
    );

    return response.data;
  }

  async descargarBoleto(ticketId: string): Promise<void> {
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const url = `${API_GATEWAY_URL}${endpoints.reservas}/boletos/${ticketId}/descargar`;

      console.log('Descargando boleto desde:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en la respuesta:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('El archivo PDF está vacío');
      }

      console.log('Blob recibido:', blob.size, 'bytes, tipo:', blob.type);

      // Crear URL y descargar
      const urlBlob = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = urlBlob;
      link.download = `boleto-${ticketId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        window.URL.revokeObjectURL(urlBlob);
      }, 5000);

    } catch (error) {
      console.error('Error al descargar el boleto:', error);
      alert('No se pudo descargar el boleto. Intenta de nuevo.');
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