import { ConflictException, NotFoundException } from '@nestjs/common';
import { ILike } from 'typeorm';
import { TipoCarteleraService } from './tipo-cartelera.service';

const mockTipo = { id: 'tipo-1', nombre: 'Estrenos' };

describe('TipoCarteleraService', () => {
  let service: TipoCarteleraService;
  let repo: Record<string, jest.Mock>;

  beforeEach(() => {
    repo = {
      find: jest.fn().mockResolvedValue([mockTipo]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
    };
    service = new TipoCarteleraService(repo as any);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debe retornar todos los tipos de cartelera', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockTipo]);
    });
  });

  describe('findOne', () => {
    it('debe retornar un tipo de cartelera por ID', async () => {
      repo.findOne.mockResolvedValue(mockTipo);
      const result = await service.findOne('tipo-1');
      expect(result).toEqual(mockTipo);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByNombre', () => {
    it('debe retornar un tipo de cartelera por nombre', async () => {
      repo.findOne.mockResolvedValue(mockTipo);
      const result = await service.findByNombre('Estrenos');
      expect(result).toEqual(mockTipo);
      expect(repo.findOne).toHaveBeenCalledWith({ where: { nombre: ILike('Estrenos') } });
    });

    it('debe lanzar NotFoundException si no existe el nombre', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findByNombre('No existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear un tipo de cartelera nuevo', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.create({ nombre: '  Proximos  ' });
      expect(result.nombre).toBe('Proximos');
    });

    it('debe lanzar ConflictException si ya existe', async () => {
      repo.findOne.mockResolvedValue(mockTipo);
      await expect(service.create({ nombre: 'Estrenos' })).rejects.toThrow(ConflictException);
    });
  });
});
