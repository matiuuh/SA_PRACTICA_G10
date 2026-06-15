import { ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FuncionesService } from './funciones.service';
import { PeliculasService } from './peliculas.service';
import { SalasService } from './salas.service';

const mockPelicula = { id: 'peli-1', titulo: 'Test Movie' };
const mockSala = { id: 'sala-1', nombre: 'Sala 1' };
const mockFuncion = {
  id: 'func-1',
  fecha: '2025-06-15',
  hora: '18:00',
  precio: 50,
  activa: true,
  pelicula: mockPelicula,
  sala: mockSala,
};

describe('FuncionesService', () => {
  let service: FuncionesService;
  let repo: Record<string, any>;
  let peliculasService: jest.Mocked<Partial<PeliculasService>>;
  let salasService: jest.Mocked<Partial<SalasService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(() => {
    const mockQueryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      innerJoin: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      offset: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      distinct: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockFuncion]),
      getOne: jest.fn().mockResolvedValue(null),
      getManyAndCount: jest.fn().mockResolvedValue([[mockFuncion], 1]),
      getRawMany: jest.fn().mockResolvedValue([{ peliculaId: 'peli-1' }]),
      getRawOne: jest.fn().mockResolvedValue({ total: '1' }),
    };

    repo = {
      find: jest.fn().mockResolvedValue([mockFuncion]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };

    peliculasService = {
      findOne: jest.fn().mockResolvedValue(mockPelicula),
    };
    salasService = {
      findOne: jest.fn().mockResolvedValue(mockSala),
    };
    configService = {
      get: jest.fn().mockReturnValue('http://reservas-service:3004'),
    };

    service = new FuncionesService(
      repo as any,
      peliculasService as unknown as PeliculasService,
      salasService as unknown as SalasService,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debe retornar todas las funciones', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockFuncion]);
    });
  });

  describe('findBySala', () => {
    it('debe retornar funciones de una sala', async () => {
      const result = await service.findBySala('sala-1');
      expect(result).toEqual([mockFuncion]);
    });
  });

  describe('findByPelicula', () => {
    it('debe retornar funciones de una pelicula', async () => {
      const result = await service.findByPelicula('peli-1');
      expect(result).toEqual([mockFuncion]);
    });
  });

  describe('findByCine', () => {
    it('debe retornar funciones de un cine', async () => {
      const result = await service.findByCine('cine-ext-1');
      expect(result).toEqual([mockFuncion]);
    });
  });

  describe('findOne', () => {
    it('debe retornar una funcion por ID', async () => {
      repo.findOne.mockResolvedValue(mockFuncion);
      const result = await service.findOne('func-1');
      expect(result).toEqual(mockFuncion);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear una funcion nueva sin conflicto', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.create({
        id_pelicula: 'peli-1',
        id_sala: 'sala-1',
        fecha: '2025-06-15',
        hora: '18:00',
        precio: 50,
      });
      expect(peliculasService.findOne).toHaveBeenCalledWith('peli-1');
      expect(salasService.findOne).toHaveBeenCalledWith('sala-1');
      expect(repo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar ConflictException si ya existe funcion en misma sala/fecha/hora', async () => {
      repo.findOne.mockResolvedValue(mockFuncion);
      await expect(
        service.create({
          id_pelicula: 'peli-1',
          id_sala: 'sala-1',
          fecha: '2025-06-15',
          hora: '18:00',
          precio: 50,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una funcion existente', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ hasBoletos: false }),
      } as never);

      repo.findOne.mockResolvedValue(mockFuncion);
      await service.remove('func-1');
      expect(repo.remove).toHaveBeenCalledWith(mockFuncion);
    });

    it('debe lanzar ConflictException si tiene boletos asociados', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ hasBoletos: true }),
      } as never);

      repo.findOne.mockResolvedValue(mockFuncion);

      await expect(service.remove('func-1')).rejects.toThrow(ConflictException);
      expect(repo.remove).not.toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar campos de la funcion', async () => {
      repo.findOne.mockResolvedValue({ ...mockFuncion, sala: { ...mockSala } });
      const result = await service.update('func-1', {
        precio: 75,
        activa: false,
      });
      expect(result.precio).toBe(75);
      expect(result.activa).toBe(false);
    });

    it('debe actualizar pelicula y sala si se envian IDs', async () => {
      repo.findOne.mockResolvedValue({ ...mockFuncion, sala: { ...mockSala } });
      await service.update('func-1', {
        id_pelicula: 'peli-2',
        id_sala: 'sala-2',
      });
      expect(peliculasService.findOne).toHaveBeenCalledWith('peli-2');
      expect(salasService.findOne).toHaveBeenCalledWith('sala-2');
    });

    it('debe verificar conflicto de horario al cambiar fecha/hora/sala', async () => {
      repo.findOne.mockResolvedValue({ ...mockFuncion, sala: { ...mockSala } });
      const qb = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue(null);

      await service.update('func-1', {
        fecha: '2025-06-20',
        hora: '20:00',
      });
      expect(repo.createQueryBuilder).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si hay conflicto de horario', async () => {
      repo.findOne.mockResolvedValue({ ...mockFuncion, sala: { ...mockSala } });
      const qb = repo.createQueryBuilder();
      qb.getOne.mockResolvedValue({ id: 'otra-funcion' });

      await expect(
        service.update('func-1', { fecha: '2025-06-20' }),
      ).rejects.toThrow(ConflictException);
    });

    it('debe actualizar sin verificar conflictos si no cambia fecha/hora/sala', async () => {
      repo.findOne.mockResolvedValue({ ...mockFuncion, sala: { ...mockSala } });
      const result = await service.update('func-1', { precio: 99 });
      expect(result.precio).toBe(99);
      expect(repo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });

  describe('findPaginated', () => {
    it('debe retornar funciones paginadas sin filtros', async () => {
      const result = await service.findPaginated({});
      expect(result.data).toEqual([mockFuncion]);
      expect(result.meta.total).toBe(1);
    });

    it('debe aplicar filtros de cine, sala y pelicula', async () => {
      const result = await service.findPaginated({
        cine: 'cine-1',
        sala: 'sala-1',
        pelicula: 'peli-1',
      });
      expect(result.data).toEqual([mockFuncion]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
    });
  });

  describe('findCarteleraPaginated', () => {
    it('debe retornar cartelera sin filtro de tipo', async () => {
      const result = await service.findCarteleraPaginated('cine-1', 1, 10);
      expect(result.data).toEqual([mockFuncion]);
      expect(result.meta.total).toBe(1);
    });

    it('debe filtrar por tipo de cartelera', async () => {
      const result = await service.findCarteleraPaginated('cine-1', 1, 10, 'Estrenos');
      expect(result.data).toEqual([mockFuncion]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(tc.nombre) = :tipoNorm',
        { tipoNorm: 'estrenos' },
      );
    });

    it('debe retornar vacio si no hay peliculas', async () => {
      mockQueryBuilder.getRawMany.mockResolvedValueOnce([]);
      mockQueryBuilder.getRawOne.mockResolvedValueOnce({ total: '0' });
      const result = await service.findCarteleraPaginated('cine-1', 1, 10);
      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });
  });

  describe('create - extra branches', () => {
    it('debe crear funcion inactiva si se envia activa=false', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.create({
        id_pelicula: 'peli-1',
        id_sala: 'sala-1',
        fecha: '2025-06-15',
        hora: '18:00',
        precio: 50,
        activa: false,
      });
      expect(result.activa).toBe(false);
    });
  });

  describe('remove - boleto service branches', () => {
    it('debe lanzar ServiceUnavailableException si falla la consulta de boletos', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));
      repo.findOne.mockResolvedValue(mockFuncion);
      await expect(service.remove('func-1')).rejects.toThrow(ServiceUnavailableException);
    });

    it('debe lanzar ServiceUnavailableException si el servicio de boletos responde no ok', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: jest.fn(),
      } as never);
      repo.findOne.mockResolvedValue(mockFuncion);
      await expect(service.remove('func-1')).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
