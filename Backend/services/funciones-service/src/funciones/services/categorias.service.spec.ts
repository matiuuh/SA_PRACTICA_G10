import { ConflictException, NotFoundException } from '@nestjs/common';
import { CategoriasService } from './categorias.service';

const mockCategoria = { id: 'cat-1', nombre: 'Accion' };

describe('CategoriasService', () => {
  let service: CategoriasService;
  let repo: Record<string, jest.Mock>;

  beforeEach(() => {
    repo = {
      find: jest.fn().mockResolvedValue([mockCategoria]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
    };
    service = new CategoriasService(repo as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debe retornar todas las categorias', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockCategoria]);
    });
  });

  describe('findOne', () => {
    it('debe retornar una categoria por ID', async () => {
      repo.findOne.mockResolvedValue(mockCategoria);
      const result = await service.findOne('cat-1');
      expect(result).toEqual(mockCategoria);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNombre', () => {
    it('debe retornar una categoria por nombre', async () => {
      repo.findOne.mockResolvedValue(mockCategoria);
      const result = await service.findByNombre('Accion');
      expect(result).toEqual(mockCategoria);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { nombre: 'Accion' } });
    });

    it('debe lanzar NotFoundException si no existe el nombre', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findByNombre('No existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear una categoria nueva', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.create({ nombre: '  Drama  ' });
      expect(result.nombre).toBe('Drama');
      expect(repo.save).toHaveBeenCalled();
    });

    it('debe lanzar ConflictException si ya existe', async () => {
      repo.findOne.mockResolvedValue(mockCategoria);
      await expect(service.create({ nombre: 'Accion' })).rejects.toThrow(ConflictException);
    });
  });
});
