import { api, endpoints } from './api';
import type {
  HistorialFiltros,
  PaginatedTicketHistory,
} from '../types/boletos.types';

class BoletosService {
  async getHistorial(
    page = 1,
    limit = 10,
    filtros?: Partial<HistorialFiltros>,
  ): Promise<PaginatedTicketHistory> {
    const params: Record<string, string | number> = {
      page,
      limit: Math.min(limit, 50),
    };

    if (filtros?.busqueda?.trim()) {
      params.identificador = filtros.busqueda.trim();
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
      { params },
    );

    return response.data;
  }

  async descargarBoleto(ticketId: string): Promise<void> {
    const response = await api.get<Blob>(
      `${endpoints.reservas}/boletos/${ticketId}/descargar`,
      {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
        timeout: 30000,
      },
    );

    const blob = response.data;
    if (blob.size === 0) {
      throw new Error('El archivo PDF está vacío');
    }

    const disposition = response.headers['content-disposition'] as
      | string
      | undefined;
    const filenameMatch = disposition?.match(/filename="?([^"]+)"?/i);
    const filename = filenameMatch?.[1] ?? `boleto-${ticketId}.pdf`;
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  }
}

export const boletosService = new BoletosService();
