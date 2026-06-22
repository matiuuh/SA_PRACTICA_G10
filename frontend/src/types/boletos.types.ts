// src/types/boletos.types.ts

// Usamos types literales en lugar de enum para evitar problemas con erasableSyntaxOnly
export type EstadoBoleto = 'VALIDO' | 'USADO';

export interface TicketHistoryItem {
  id: string;
  codigoQr: string;
  estado: EstadoBoleto;
  fechaEmision: string;
  fechaUso: string | null;
  validadoPor: string | null;
  reserva: {
    id: string;
    usuarioId: string;
    fechaReserva: string;
    total: number;
  };
  funcion: {
    id: string | null;
    fecha: string | null;
    hora: string | null;
    sala: string | null;
  };
  pelicula: {
    id: string | null;
    titulo: string | null;
  };
  asientos: Array<{
    id: string;
    fila: string;
    numero: number;
  }>;
}

export interface PaginatedTicketHistory {
  data: TicketHistoryItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    totalsByStatus: {
      validos: number;
      usados: number;
    };
  };
}

export interface HistorialFiltros {
  busqueda: string;
  fechaInicio: string;
  fechaFin: string;
  estado: 'todos' | 'VALIDO' | 'USADO';
}
