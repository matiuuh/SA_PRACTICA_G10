import { NotFoundException } from '@nestjs/common';
import { SalasService } from './salas.service';

const mockSala = { id: 'sala-1', nombre: 'Sala 1', capacidad: 100 };

describe('SalasService', () => {
  let service: SalasService;
  let repo: Record<string, jest.Mock>;

  beforeEach(() => {
    repo = {
      find: jest.fn().mockResolvedValue([mockSala]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
      remove: jest.fn().mockResolvedValue(undefined),
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
});
