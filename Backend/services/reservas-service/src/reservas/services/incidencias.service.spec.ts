import { NotFoundException } from '@nestjs/common';
import { EstadoIncidencia } from '../enums/estado-incidencia.enum';
import { TipoIncidencia } from '../enums/tipo-incidencia.enum';
import { IncidenciasService } from './incidencias.service';

describe('IncidenciasService', () => {
  let service: IncidenciasService;
  let repository: Record<string, jest.Mock>;

  beforeEach(() => {
    repository = {
      create: jest.fn((value) => value),
      save: jest.fn(async (value) => value),
      findAndCount: jest.fn().mockResolvedValue([[], 0]),
      findOne: jest.fn(),
    };
    service = new IncidenciasService(repository as any);
  });

  it('crea una incidencia pendiente', async () => {
    const result = await service.create('user-1', {
      tipo: TipoIncidencia.PROBLEMA,
      asunto: ' Problema ',
      descripcion: ' Descripcion del problema ',
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        usuarioIdExterno: 'user-1',
        tipo: TipoIncidencia.PROBLEMA,
        asunto: 'Problema',
        descripcion: 'Descripcion del problema',
        estado: EstadoIncidencia.PENDIENTE,
      }),
    );
    expect(result.estado).toBe(EstadoIncidencia.PENDIENTE);
  });

  it('lista únicamente incidencias del usuario', async () => {
    await service.findByUser('user-1', { page: 2, limit: 5 });

    expect(repository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { usuarioIdExterno: 'user-1' },
        skip: 5,
        take: 5,
      }),
    );
  });

  it('responde y cierra una incidencia', async () => {
    repository.findOne.mockResolvedValue({
      id: 'inc-1',
      estado: EstadoIncidencia.PENDIENTE,
    });

    const result = await service.respond(
      'inc-1',
      ' Respuesta administrativa ',
      'admin-1',
    );

    expect(result).toEqual(
      expect.objectContaining({
        respuesta: 'Respuesta administrativa',
        estado: EstadoIncidencia.RESPONDIDA,
        administradorIdExterno: 'admin-1',
        fechaRespuesta: expect.any(Date),
      }),
    );
  });

  it('rechaza una incidencia inexistente', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.respond('no-existe', 'Respuesta', 'admin-1'),
    ).rejects.toThrow(NotFoundException);
  });
});
