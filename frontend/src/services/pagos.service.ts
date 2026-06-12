import { api, endpoints } from './api';
import type { Pago } from '../types/pagos.types';

class PagosService {
  async getPagosByReserva(reservaId: string): Promise<Pago[]> {
    const response = await api.get<Pago[]>(`${endpoints.pagos}/reserva/${reservaId}`);
    return response.data;
  }
}

export const pagosService = new PagosService();
