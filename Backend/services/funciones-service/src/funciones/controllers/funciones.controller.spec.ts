import { FuncionesController } from './funciones.controller';

const mockService = {
  findAll: jest.fn(),
  findBySala: jest.fn(),
  findByPelicula: jest.fn(),
  findByCine: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('FuncionesController', () => {
  let controller: FuncionesController;

  beforeEach(() => {
    controller = new FuncionesController(mockService as any);
    jest.clearAllMocks();
  });

  describe('health', () => {
    it('debe retornar status ok con nombre del servicio', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('funciones-service');
    });
  });

  describe('findAll', () => {
    it('debe retornar todas las funciones cuando no hay filtros', () => {
      mockService.findAll.mockResolvedValue([]);
      controller.findAll();
      expect(mockService.findAll).toHaveBeenCalled();
    });

    it('debe filtrar por sala cuando se provee el query param sala', () => {
      mockService.findBySala.mockResolvedValue([]);
      controller.findAll('sala-1');
      expect(mockService.findBySala).toHaveBeenCalledWith('sala-1');
      expect(mockService.findAll).not.toHaveBeenCalled();
    });

    it('debe filtrar por pelicula cuando se provee el query param pelicula', () => {
      mockService.findByPelicula.mockResolvedValue([]);
      controller.findAll(undefined, 'pel-1');
      expect(mockService.findByPelicula).toHaveBeenCalledWith('pel-1');
    });

    it('debe filtrar por cine cuando se provee el query param cine', () => {
      mockService.findByCine.mockResolvedValue([]);
      controller.findAll(undefined, undefined, 'cine-1');
      expect(mockService.findByCine).toHaveBeenCalledWith('cine-1');
    });
  });

  it('findOne debe delegar al servicio con el id', () => {
    mockService.findOne.mockResolvedValue({ id: 'func-1' });
    controller.findOne('func-1');
    expect(mockService.findOne).toHaveBeenCalledWith('func-1');
  });

  it('create debe delegar al servicio con el dto', () => {
    const dto = { salaId: 'sala-1', peliculaId: 'pel-1' };
    mockService.create.mockResolvedValue({ id: 'func-1', ...dto });
    controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update debe delegar al servicio con id y dto', () => {
    const dto = { hora: '20:00' };
    mockService.update.mockResolvedValue({ id: 'func-1', ...dto });
    controller.update('func-1', dto as any);
    expect(mockService.update).toHaveBeenCalledWith('func-1', dto);
  });

  it('remove debe delegar al servicio y retornar mensaje de confirmacion', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('func-1');
    expect(mockService.remove).toHaveBeenCalledWith('func-1');
    expect(result.message).toContain('func-1');
  });
});
