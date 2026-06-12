import { SalasController } from './salas.controller';

const mockService = {
  findAll: jest.fn(),
  findByCine: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('SalasController', () => {
  let controller: SalasController;

  beforeEach(() => {
    controller = new SalasController(mockService as any);
    jest.clearAllMocks();
  });

  it('findAll debe delegar al servicio', () => {
    mockService.findAll.mockResolvedValue([]);
    controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findByCine debe delegar al servicio con el id de cine', () => {
    mockService.findByCine.mockResolvedValue([]);
    controller.findByCine('cine-1');
    expect(mockService.findByCine).toHaveBeenCalledWith('cine-1');
  });

  it('findOne debe delegar al servicio con el id', () => {
    mockService.findOne.mockResolvedValue({ id: 'sala-1' });
    controller.findOne('sala-1');
    expect(mockService.findOne).toHaveBeenCalledWith('sala-1');
  });

  it('create debe delegar al servicio con el dto', () => {
    const dto = { nombre: 'Sala 1', capacidad: 100 };
    mockService.create.mockResolvedValue({ id: 'sala-1', ...dto });
    controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });

  it('update debe delegar al servicio con id y dto', () => {
    const dto = { nombre: 'Sala 1 Actualizada' };
    mockService.update.mockResolvedValue({ id: 'sala-1', ...dto });
    controller.update('sala-1', dto as any);
    expect(mockService.update).toHaveBeenCalledWith('sala-1', dto);
  });

  it('remove debe delegar al servicio y retornar mensaje de confirmacion', async () => {
    mockService.remove.mockResolvedValue(undefined);
    const result = await controller.remove('sala-1');
    expect(mockService.remove).toHaveBeenCalledWith('sala-1');
    expect(result.message).toContain('sala-1');
  });
});
