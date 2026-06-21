import { NotFoundException } from '@nestjs/common';
import { LocalidadesService } from './localidades.service';

const mockCiudad = { id: 'ciudad-1', nombre: 'Guatemala' };
const mockCine = {
  id: 'cine-1',
  nombre: 'Cine Central',
  direccion: 'Zona 1',
  ciudad: mockCiudad,
};

describe('LocalidadesService', () => {
  let service: LocalidadesService;
  let ciudadesRepo: Record<string, jest.Mock>;
  let cinesRepo: Record<string, jest.Mock>;
  let queryBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockCine], 1]),
    };
    ciudadesRepo = {
      find: jest.fn().mockResolvedValue([mockCiudad]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation(async (data) => data),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    cinesRepo = {
      find: jest.fn().mockResolvedValue([mockCine]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation(async (data) => data),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };

    service = new LocalidadesService(
      ciudadesRepo as any,
      cinesRepo as any,
    );
  });

  it('consulta ciudades y cines', async () => {
    await expect(service.findCiudades()).resolves.toEqual([mockCiudad]);
    await expect(service.findCines()).resolves.toEqual([mockCine]);
  });

  it('crea una ciudad normalizando el nombre', async () => {
    await expect(service.createCiudad({ nombre: '  Guatemala  ' })).resolves.toEqual(
      expect.objectContaining({ nombre: 'Guatemala' }),
    );
  });

  it('consulta, actualiza y elimina una ciudad existente', async () => {
    ciudadesRepo.findOne.mockResolvedValue({ ...mockCiudad });

    await expect(service.findCiudadById('ciudad-1')).resolves.toEqual(mockCiudad);
    await expect(
      service.updateCiudad('ciudad-1', { nombre: '  Mixco  ' }),
    ).resolves.toEqual(expect.objectContaining({ nombre: 'Mixco' }));
    await expect(service.updateCiudad('ciudad-1', {})).resolves.toEqual(
      expect.objectContaining({ nombre: 'Mixco' }),
    );
    await expect(service.removeCiudad('ciudad-1')).resolves.toBeUndefined();
  });

  it('crea un cine asociado a una ciudad existente', async () => {
    ciudadesRepo.findOne.mockResolvedValue(mockCiudad);

    await expect(
      service.createCine({
        nombre: '  Cine Central  ',
        direccion: '  Zona 1  ',
        idCiudad: 'ciudad-1',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        nombre: 'Cine Central',
        direccion: 'Zona 1',
        ciudad: mockCiudad,
      }),
    );
  });

  it('rechaza un cine cuando la ciudad no existe', async () => {
    ciudadesRepo.findOne.mockResolvedValue(null);

    await expect(
      service.createCine({
        nombre: 'Cine',
        direccion: 'Dirección',
        idCiudad: 'no-existe',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('pagina y filtra cines', async () => {
    const result = await service.findCinesPaginated({
      page: 2,
      limit: 5,
      search: 'central',
      idCiudad: 'ciudad-1',
    });

    expect(result.meta).toEqual({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
    });
    expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
  });

  it('pagina cines con valores por defecto y límite máximo', async () => {
    const defaults = await service.findCinesPaginated({});
    const capped = await service.findCinesPaginated({ limit: 100 });

    expect(defaults.meta.page).toBe(1);
    expect(defaults.meta.limit).toBe(10);
    expect(capped.meta.limit).toBe(50);
  });

  it('consulta cines por id y ciudad', async () => {
    cinesRepo.findOne.mockResolvedValue(mockCine);
    ciudadesRepo.findOne.mockResolvedValue(mockCiudad);

    await expect(service.findCineById('cine-1')).resolves.toEqual(mockCine);
    await expect(service.findCinesByCiudad('ciudad-1')).resolves.toEqual([
      mockCine,
    ]);
  });

  it('actualiza y elimina un cine existente', async () => {
    cinesRepo.findOne.mockResolvedValue({ ...mockCine });
    ciudadesRepo.findOne.mockResolvedValue(mockCiudad);

    await expect(
      service.updateCine('cine-1', {
        nombre: '  Renovado  ',
        direccion: '  Zona 10  ',
        idCiudad: 'ciudad-1',
      }),
    ).resolves.toEqual(
      expect.objectContaining({
        nombre: 'Renovado',
        direccion: 'Zona 10',
        ciudad: mockCiudad,
      }),
    );
    await expect(service.updateCine('cine-1', {})).resolves.toEqual(
      expect.objectContaining({ nombre: 'Renovado' }),
    );
    await expect(service.removeCine('cine-1')).resolves.toBeUndefined();
  });

  it('lanza NotFoundException para ids inexistentes', async () => {
    ciudadesRepo.findOne.mockResolvedValue(null);
    cinesRepo.findOne.mockResolvedValue(null);

    await expect(service.findCiudadById('no-existe')).rejects.toThrow(
      NotFoundException,
    );
    await expect(service.findCineById('no-existe')).rejects.toThrow(
      NotFoundException,
    );
  });
});
