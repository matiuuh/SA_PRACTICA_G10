import { EstadoBoleto } from '../enums/estado-boleto.enum';

export interface TicketHistoryItem {
  id: string;
  codigoQr: string;
  estado: EstadoBoleto;
  fechaEmision: Date;
  fechaUso: Date | null;
  validadoPor: string | null;
  reserva: {
    id: string;
    usuarioId: string;
    fechaReserva: Date;
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
  };
}
