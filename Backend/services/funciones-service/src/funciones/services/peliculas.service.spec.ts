import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PeliculasService } from './peliculas.service';
import { CategoriasService } from './categorias.service';
import { TipoCarteleraService } from './tipo-cartelera.service';

const mockCategoria = { id: 'cat-1', nombre: 'Accion' };
const mockTipoCartelera = { id: 'tipo-1', nombre: 'Estrenos' };
const mockPelicula = {
  id: 'peli-1',
  titulo: 'Test Movie',
  sinopsis: 'Sinopsis',
  duracion_minutos: 120,
  poster_url: null,
  activa: true,
  categoria: mockCategoria,
  tipoCartelera: mockTipoCartelera,
  funciones: [],
};

describe('PeliculasService', () => {
  let service: PeliculasService;
  let repo: Record<string, any>;
  let categoriasService: jest.Mocked<Partial<CategoriasService>>;
  let tipoCarteleraService: jest.Mocked<Partial<TipoCarteleraService>>;

  beforeEach(() => {
    const mockQb = {
      innerJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    };

    repo = {
      find: jest.fn().mockResolvedValue([mockPelicula]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d: any) => d),
      save: jest.fn().mockImplementation((d: any) => Promise.resolve(d)),
      remove: jest.fn().mockResolvedValue(undefined),
      createQueryBuilder: jest.fn().mockReturnValue(mockQb),
    };
    categoriasService = { findOne: jest.fn().mockResolvedValue(mockCategoria) };
    tipoCarteleraService = { findOne: jest.fn().mockResolvedValue(mockTipoCartelera) };

    service = new PeliculasService(
      repo as any,
      categoriasService as unknown as CategoriasService,
      tipoCarteleraService as unknown as TipoCarteleraService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('debe retornar todas las peliculas', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockPelicula]);
    });
  });

  describe('findByTipoCartelera', () => {
    it('debe retornar peliculas por tipo de cartelera', async () => {
      const result = await service.findByTipoCartelera('tipo-1');
      expect(result).toEqual([mockPelicula]);
    });
  });

  describe('findOne', () => {
    it('debe retornar una pelicula por ID', async () => {
      repo.findOne.mockResolvedValue(mockPelicula);
      const result = await service.findOne('peli-1');
      expect(result).toEqual(mockPelicula);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('debe crear una pelicula nueva', async () => {
      repo.findOne.mockResolvedValue(null);
      const result = await service.create({
        titulo: '  New Movie  ',
        sinopsis: '  Synopsis  ',
        duracion_minutos: 90,
        poster_url: '  http://img.com/poster  ',
        activa: true,
        id_categoria: 'cat-1',
        id_tipo_cartelera: 'tipo-1',
      });
      expect(result.titulo).toBe('New Movie');
      expect(result.sinopsis).toBe('Synopsis');
      expect(result.poster_url).toBe('http://img.com/poster');
    });

    it('debe lanzar ConflictException si ya existe el titulo', async () => {
      repo.findOne.mockResolvedValue(mockPelicula);
      await expect(
        service.create({
          titulo: 'Test Movie',
          id_categoria: 'cat-1',
          id_tipo_cartelera: 'tipo-1',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('debe actualizar una pelicula existente', async () => {
      repo.findOne.mockResolvedValue({ ...mockPelicula });
      const result = await service.update('peli-1', {
        titulo: '  Updated  ',
        id_categoria: 'cat-2',
        id_tipo_cartelera: 'tipo-2',
      });
      expect(result.titulo).toBe('Updated');
      expect(categoriasService.findOne).toHaveBeenCalledWith('cat-2');
      expect(tipoCarteleraService.findOne).toHaveBeenCalledWith('tipo-2');
    });
  });

  describe('remove', () => {
    it('debe eliminar una pelicula sin funciones activas', async () => {
      repo.findOne.mockResolvedValue(mockPelicula);
      await service.remove('peli-1');
      expect(repo.remove).toHaveBeenCalledWith(mockPelicula);
    });

    it('debe lanzar BadRequestException si tiene funciones activas', async () => {
      repo.findOne.mockResolvedValue(mockPelicula);
      repo.createQueryBuilder().getCount.mockResolvedValue(2);
      await expect(service.remove('peli-1')).rejects.toThrow(BadRequestException);
    });
  });
});
