import { CategoriasController } from './categorias.controller';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('CategoriasController', () => {
  let controller: CategoriasController;

  beforeEach(() => {
    controller = new CategoriasController(mockService as any);
    jest.clearAllMocks();
  });

  it('findAll debe delegar al servicio', () => {
    mockService.findAll.mockResolvedValue([]);
    controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne debe delegar al servicio con el id', () => {
    mockService.findOne.mockResolvedValue({ id: 'cat-1' });
    controller.findOne('cat-1');
    expect(mockService.findOne).toHaveBeenCalledWith('cat-1');
  });

  it('create debe delegar al servicio con el dto', () => {
    const dto = { nombre: 'ACCION' };
    mockService.create.mockResolvedValue({ id: 'cat-1', ...dto });
    controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });
});
