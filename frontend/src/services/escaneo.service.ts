import { api, endpoints } from './api';
import type { BoletoValidacion } from '../types/admin.types';

class EscaneoService {
  async validarBoleto(codigo: string): Promise<BoletoValidacion> {
    const response = await api.post<BoletoValidacion>(
      `${endpoints.escaneo}/validar`,
      { codigo },
    );

    return response.data;
  }
}

export const escaneoService = new EscaneoService();
