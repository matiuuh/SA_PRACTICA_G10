import { PeliculasController } from './peliculas.controller';

const mockService = {
  findAll: jest.fn(),
  findByTipoCartelera: jest.fn(),
  findPaginated: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  importCsv: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('PeliculasController', () => {
  let controller: PeliculasController;

  beforeEach(() => {
    controller = new PeliculasController(mockService as any);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('debe delegar busqueda paginada al servicio', () => {
      const query = { page: 1, limit: 10, search: 'avatar' };
      mockService.findPaginated.mockResolvedValue({ data: [], meta: {} });
      controller.findAll(query as any);
      expect(mockService.findPaginated).toHaveBeenCalledWith(query);
    });
  });

  it('findOne debe delegar al servicio con el id', () => {
    mockService.findOne.mockResolvedValue({ id: 'pel-1' });
    controller.findOne('pel-1');
    expect(mockService.findOne).toHaveBeenCalledWith('pel-1');
  });

  it('create debe delegar al servicio con el dto', () => {
    const dto = { titulo: 'Avengers' };
    mockService.create.mockResolvedValue({ id: 'pel-1', ...dto });
    controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('importCsv debe delegar al servicio con el archivo recibido', () => {
    const file = { buffer: Buffer.from('titulo,id_categoria,id_tipo_cartelera') };
    mockService.importCsv.mockResolvedValue({ insertadas: 0, fallidas: 0, errores: [] });
    controller.importCsv(file);
    expect(mockService.importCsv).toHaveBeenCalledWith(file);
  });

  it('update debe delegar al servicio con id y dto', () => {
    const dto = { titulo: 'Avengers Endgame' };
    mockService.update.mockResolvedValue({ id: 'pel-1', ...dto });
    controller.update('pel-1', dto as any);
    expect(mockService.update).toHaveBeenCalledWith('pel-1', dto);
  });

  it('remove debe delegar al servicio y retornar mensaje de confirmacion', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('pel-1');
    expect(mockService.remove).toHaveBeenCalledWith('pel-1');
    expect(result.message).toContain('pel-1');
  });
});
