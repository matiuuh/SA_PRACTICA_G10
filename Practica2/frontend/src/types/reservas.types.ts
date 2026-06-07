export interface ReservaAsiento {
  id: string;
  fila: string;
  numero: number;
  idFuncionExterna: string;
}

export interface ReservaBoleto {
  id: string;
  codigoQr: string;
  fechaEmision: string;
}

export interface ReservaEstado {
  id: string;
  nombre: string;
}

export interface ReservaDetalle {
  id: string;
  asiento: ReservaAsiento;
}

export interface Reserva {
  id: string;
  usuarioIdExterno: string;
  fechaReserva: string;
  fechaExpiracion: string | null;
  total: number;
  estado: ReservaEstado;
  detalles: ReservaDetalle[];
  boletos: ReservaBoleto[];
}

export interface CheckoutPayload {
  usuarioIdExterno: string;
  asientosIds: string[];
  total: number;
  metodoPago: 'TARJETA' | 'PAYPAL';
  numeroTarjeta?: string;
  nombreTitular?: string;
  fechaExpiracion?: string;
  cvv?: string;
  paypalEmail?: string;
}

export interface CreateAsientoPayload {
  fila: string;
  numero: number;
  idFuncionExterna: string;
}
