import { TipoCarteleraController } from './tipo-cartelera.controller';

const mockService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
};

describe('TipoCarteleraController', () => {
  let controller: TipoCarteleraController;

  beforeEach(() => {
    controller = new TipoCarteleraController(mockService as any);
    jest.clearAllMocks();
  });

  it('findAll debe delegar al servicio', () => {
    mockService.findAll.mockResolvedValue([]);
    controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
  });

  it('findOne debe delegar al servicio con el id', () => {
    mockService.findOne.mockResolvedValue({ id: 'tc-1' });
    controller.findOne('tc-1');
    expect(mockService.findOne).toHaveBeenCalledWith('tc-1');
  });

  it('create debe delegar al servicio con el dto', () => {
    const dto = { nombre: 'ESTRENO' };
    mockService.create.mockResolvedValue({ id: 'tc-1', ...dto });
    controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
  });
});
