import { NotFoundException } from '@nestjs/common';
import { SalasService } from './salas.service';

const mockSala = { id: 'sala-1', nombre: 'Sala 1', capacidad: 100, tipo: '2D', id_cine_externo: 'cine-1' };

describe('SalasService', () => {
  let service: SalasService;
  let repo: Record<string, jest.Mock>;
  let mockQueryBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    mockQueryBuilder = {
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockSala], 1]),
    };

    repo = {
      find: jest.fn().mockResolvedValue([mockSala]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
    service = new SalasService(repo as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debe retornar todas las salas', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockSala]);
    });
  });

  describe('findOne', () => {
    it('debe retornar una sala por ID', async () => {
      repo.findOne.mockResolvedValue(mockSala);
      const result = await service.findOne('sala-1');
      expect(result).toEqual(mockSala);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear una sala nueva', async () => {
      const result = await service.create({ nombre: 'Sala 2', capacidad: 80, id_cine_externo: 'cine-uuid-1' });
      expect(result.nombre).toBe('Sala 2');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('debe actualizar una sala existente', async () => {
      repo.findOne.mockResolvedValue({ ...mockSala });
      const result = await service.update('sala-1', { nombre: 'Sala Renovada', capacidad: 150 });
      expect(result.nombre).toBe('Sala Renovada');
      expect(result.capacidad).toBe(150);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('no-existe', { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar una sala existente', async () => {
      repo.findOne.mockResolvedValue(mockSala);
      await service.remove('sala-1');
      expect(repo.remove).toHaveBeenCalledWith(mockSala);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.remove('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByCine', () => {
    it('debe retornar salas de un cine', async () => {
      const result = await service.findByCine('cine-1');
      expect(result).toEqual([mockSala]);
      expect(repo.find).toHaveBeenCalledWith({ where: { id_cine_externo: 'cine-1' } });
    });
  });

  describe('findPaginated', () => {
    it('debe retornar salas paginadas sin filtros', async () => {
      const result = await service.findPaginated({});
      expect(result.data).toEqual([mockSala]);
      expect(result.meta.total).toBe(1);
    });

    it('debe filtrar por cine', async () => {
      const result = await service.findPaginated({ cine: 'cine-1' });
      expect(result.data).toEqual([mockSala]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('sala.id_cine_externo = :cine', {
        cine: 'cine-1',
      });
    });

    it('debe filtrar por busqueda', async () => {
      const result = await service.findPaginated({ search: 'Sala' });
      expect(result.data).toEqual([mockSala]);
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('LOWER(sala.nombre) LIKE :search', {
        search: '%sala%',
      });
    });
  });

  describe('create - tipo branch', () => {
    it('debe usar tipo 2D por defecto', async () => {
      const result = await service.create({
        nombre: 'Sala X',
        capacidad: 100,
        id_cine_externo: 'cine-1',
      });
      expect(result.tipo).toBe('2D');
    });
  });

  describe('update - partial branches', () => {
    it('debe mantener campos existentes si no se envian', async () => {
      repo.findOne.mockResolvedValue({ ...mockSala });
      const result = await service.update('sala-1', {});
      expect(result.nombre).toBe('Sala 1');
      expect(result.capacidad).toBe(100);
      expect(result.tipo).toBe('2D');
      expect(result.id_cine_externo).toBe('cine-1');
    });

    it('debe actualizar id_cine_externo', async () => {
      repo.findOne.mockResolvedValue({ ...mockSala });
      const result = await service.update('sala-1', { id_cine_externo: 'cine-2' });
      expect(result.id_cine_externo).toBe('cine-2');
    });
  });
});
