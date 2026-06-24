import { HttpException, ServiceUnavailableException } from '@nestjs/common';
import { AxiosError } from 'axios';
import { of, throwError } from 'rxjs';
import { EscaneoService } from './escaneo.service';

describe('EscaneoService', () => {
  const httpService = { post: jest.fn() };
  const configService = {
    get: jest.fn((key: string, fallback: string) => ({
      RESERVAS_SERVICE_URL: 'http://reservas:3004',
      INTERNAL_SERVICE_TOKEN: 'internal-test-token',
    })[key] ?? fallback),
  };
  const service = new EscaneoService(httpService as never, configService as never);

  beforeEach(() => jest.clearAllMocks());

  it('envia la validacion al endpoint interno de reservas', async () => {
    const ticket = { id: 'ticket-1', estado: 'USADO' };
    httpService.post.mockReturnValue(of({ data: ticket }));

    await expect(service.validar(' BOL-001 ', 'admin-1')).resolves.toEqual(ticket);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://reservas:3004/api/reservas/internal/boletos/validar-escaneo',
      { codigo: 'BOL-001', administradorId: 'admin-1' },
      { headers: { 'x-internal-service-token': 'internal-test-token' } },
    );
  });

  it('preserva el estado y mensaje retornado por reservas', async () => {
    const error = new AxiosError('conflict');
    error.response = {
      status: 409,
      data: { message: 'El boleto ya fue utilizado' },
    } as never;
    httpService.post.mockReturnValue(throwError(() => error));

    await expect(service.validar('BOL-001', 'admin-1')).rejects.toBeInstanceOf(
      HttpException,
    );
  });

  it('reporta indisponibilidad cuando reservas no responde', async () => {
    httpService.post.mockReturnValue(throwError(() => new Error('network')));

    await expect(service.validar('BOL-001', 'admin-1')).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
