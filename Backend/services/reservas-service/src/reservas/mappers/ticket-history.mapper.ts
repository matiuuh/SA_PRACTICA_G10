import { Boleto } from '../entities/boleto.entity';
import { TicketHistoryItem } from '../interfaces/ticket-history.interface';

export const mapTicketHistoryItem = (boleto: Boleto): TicketHistoryItem => ({
  id: boleto.id,
  codigoQr: boleto.codigoQr,
  estado: boleto.estado,
  fechaEmision: boleto.fechaEmision,
  fechaUso: boleto.fechaUso ?? null,
  validadoPor: boleto.validadoPor ?? null,
  reserva: {
    id: boleto.reserva.id,
    usuarioId: boleto.reserva.usuarioIdExterno,
    fechaReserva: boleto.reserva.fechaReserva,
    total: Number(boleto.reserva.total),
  },
  funcion: {
    id: boleto.idFuncionExterna ?? null,
    fecha: boleto.fechaFuncion ?? null,
    hora: boleto.horaFuncion ?? null,
    sala: boleto.salaNombre ?? null,
  },
  pelicula: {
    id: boleto.idPeliculaExterna ?? null,
    titulo: boleto.tituloPelicula ?? null,
  },
  asientos: (boleto.reserva.detalles ?? [])
    .map((detalle) => ({
      id: detalle.asiento.id,
      fila: detalle.asiento.fila,
      numero: detalle.asiento.numero,
    }))
    .sort(
      (a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero,
    ),
});
