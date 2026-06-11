import { api, endpoints } from './api';
import type {
  CheckoutPayload,
  CreateAsientoPayload,
  Reserva,
  ReservaAsiento,
} from '../types/reservas.types';

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
}

export const reservasService = new ReservasService();
