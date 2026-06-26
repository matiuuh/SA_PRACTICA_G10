import { UnauthorizedException } from '@nestjs/common';
import { EscaneoController } from './escaneo.controller';

describe('EscaneoController', () => {
  const service = { validar: jest.fn() };
  const controller = new EscaneoController(service as never);

  beforeEach(() => jest.clearAllMocks());

  it('reporta la salud del servicio', () => {
    expect(controller.health().service).toBe('escaneo-service');
  });

  it('delega el codigo y el administrador autenticado', () => {
    controller.validar({ codigo: ' BOL-001 ' }, { user: { id: 'admin-1' } });

    expect(service.validar).toHaveBeenCalledWith(' BOL-001 ', 'admin-1');
  });

  it('rechaza solicitudes sin usuario autenticado', () => {
    expect(() => controller.validar({ codigo: 'BOL-001' }, {})).toThrow(
      UnauthorizedException,
    );
  });
});
