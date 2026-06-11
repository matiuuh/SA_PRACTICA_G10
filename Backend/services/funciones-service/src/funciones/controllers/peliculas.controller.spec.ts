import { PeliculasController } from './peliculas.controller';

const mockService = {
  findAll: jest.fn(),
  findByTipoCartelera: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
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
    it('debe retornar todas las peliculas cuando no hay filtro', () => {
      mockService.findAll.mockResolvedValue([]);
      controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
      expect(mockService.findByTipoCartelera).not.toHaveBeenCalled();
    });

    it('debe filtrar por tipo de cartelera cuando se provee el query param', () => {
      mockService.findByTipoCartelera.mockResolvedValue([]);
      controller.findAll('ESTRENO');
      expect(mockService.findByTipoCartelera).toHaveBeenCalledWith('ESTRENO');
      expect(mockService.findAll).not.toHaveBeenCalled();
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
