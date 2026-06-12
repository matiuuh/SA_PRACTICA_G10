export interface MetodoPago {
  id: string;
  nombre: string;
}

export interface EstadoPago {
  id: string;
  nombre: string;
}

export interface TransaccionPago {
  id: string;
  referencia: string;
  autorizacion: string | null;
  fechaTransaccion: string;
}

export interface Pago {
  id: string;
  reservaIdExterna: string;
  monto: number;
  fechaPago: string;
  metodo: MetodoPago;
  estado: EstadoPago;
  transacciones: TransaccionPago[];
}
