import { LocalidadesController } from './localidades.controller';
import { LocalidadesService } from './localidades.service';

describe('LocalidadesController', () => {
  let controller: LocalidadesController;
  let service: Record<string, jest.Mock>;

  beforeEach(() => {
    service = {
      findCiudades: jest.fn(),
      findCiudadById: jest.fn(),
      findCinesByCiudad: jest.fn(),
      findCines: jest.fn(),
      createCiudad: jest.fn(),
      createCine: jest.fn(),
      updateCine: jest.fn(),
      removeCine: jest.fn(),
      findCineById: jest.fn(),
      findSalas: jest.fn(),
      findSalaById: jest.fn(),
      createSala: jest.fn(),
    };

    controller = new LocalidadesController(service as unknown as LocalidadesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('health retorna estado del servicio', () => {
    const result = controller.health();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('localidades-service');
    expect(typeof result.timestamp).toBe('string');
  });

  it('findCiudades delega al service', async () => {
    service.findCiudades.mockResolvedValue(['ciudad']);

    await expect(controller.findCiudades()).resolves.toEqual(['ciudad']);
    expect(service.findCiudades).toHaveBeenCalledTimes(1);
  });

  it('findCiudadById delega al service con el id', async () => {
    service.findCiudadById.mockResolvedValue({ id: 'c1' });

    await expect(controller.findCiudadById('c1')).resolves.toEqual({ id: 'c1' });
    expect(service.findCiudadById).toHaveBeenCalledWith('c1');
  });

  it('findCinesByCiudad delega al service con el id de ciudad', async () => {
    service.findCinesByCiudad.mockResolvedValue(['cine']);

    await expect(controller.findCinesByCiudad('c1')).resolves.toEqual(['cine']);
    expect(service.findCinesByCiudad).toHaveBeenCalledWith('c1');
  });

  it('findCines delega al service', async () => {
    service.findCines.mockResolvedValue(['cine']);

    await expect(controller.findCines()).resolves.toEqual(['cine']);
    expect(service.findCines).toHaveBeenCalledTimes(1);
  });

  it('findCinesPaginated delega con query params convertidos', async () => {
    service.findCinesPaginated.mockResolvedValue({ data: ['cine'], meta: {} as any });

    await expect(
      controller.findCinesPaginated('2', '5', 'Cine', 'ciudad-1'),
    ).resolves.toEqual({ data: ['cine'], meta: {} });
    expect(service.findCinesPaginated).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      search: 'Cine',
      idCiudad: 'ciudad-1',
    });
  });

  it('findCinesPaginated delega sin query params', async () => {
    service.findCinesPaginated.mockResolvedValue({ data: ['cine'], meta: {} as any });

    await expect(controller.findCinesPaginated()).resolves.toEqual({ data: ['cine'], meta: {} });
    expect(service.findCinesPaginated).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
      search: undefined,
      idCiudad: undefined,
    });
  });

  it('createCiudad delega al service con el dto', async () => {
    const dto = { nombre: 'Guatemala' };
    service.createCiudad.mockResolvedValue(dto);

    await expect(controller.createCiudad(dto as any)).resolves.toEqual(dto);
    expect(service.createCiudad).toHaveBeenCalledWith(dto);
  });

  it('createCine delega al service con el dto', async () => {
    const dto = { nombre: 'Cine', direccion: 'Zona 1', idCiudad: 'c1' };
    service.createCine.mockResolvedValue(dto);

    await expect(controller.createCine(dto as any)).resolves.toEqual(dto);
    expect(service.createCine).toHaveBeenCalledWith(dto);
  });

  it('updateCine delega al service con id y dto', async () => {
    const dto = { nombre: 'Nuevo Cine' };
    service.updateCine.mockResolvedValue({ id: 'cine-1', ...dto });

    await expect(controller.updateCine('cine-1', dto as any)).resolves.toEqual({
      id: 'cine-1',
      ...dto,
    });
    expect(service.updateCine).toHaveBeenCalledWith('cine-1', dto);
  });

  it('removeCine delega al service con el id', async () => {
    service.removeCine.mockResolvedValue(undefined);

    await expect(controller.removeCine('cine-1')).resolves.toBeUndefined();
    expect(service.removeCine).toHaveBeenCalledWith('cine-1');
  });

  it('findCineById delega al service con el id', async () => {
    service.findCineById.mockResolvedValue({ id: 'cine-1' });

    await expect(controller.findCineById('cine-1')).resolves.toEqual({ id: 'cine-1' });
    expect(service.findCineById).toHaveBeenCalledWith('cine-1');
  });

  it('findSalas delega al service', async () => {
    service.findSalas.mockResolvedValue(['sala']);

    await expect(controller.findSalas()).resolves.toEqual(['sala']);
    expect(service.findSalas).toHaveBeenCalledTimes(1);
  });

  it('findSalaById delega al service con el id', async () => {
    service.findSalaById.mockResolvedValue({ id: 'sala-1' });

    await expect(controller.findSalaById('sala-1')).resolves.toEqual({ id: 'sala-1' });
    expect(service.findSalaById).toHaveBeenCalledWith('sala-1');
  });

  it('createSala delega al service con el dto', async () => {
    const dto = { nombre: 'Sala 1', capacidad: 100, idCine: 'cine-1' };
    service.createSala.mockResolvedValue(dto);

    await expect(controller.createSala(dto as any)).resolves.toEqual(dto);
    expect(service.createSala).toHaveBeenCalledWith(dto);
  });
});
