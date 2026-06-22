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
      findCinesPaginated: jest.fn(),
      findCineById: jest.fn(),
      createCiudad: jest.fn(),
      createCine: jest.fn(),
      updateCine: jest.fn(),
      removeCine: jest.fn(),
    };

    controller = new LocalidadesController(
      service as unknown as LocalidadesService,
    );
  });

  it('health retorna el estado del servicio', () => {
    expect(controller.health()).toEqual(
      expect.objectContaining({
        status: 'ok',
        service: 'localidades-service',
      }),
    );
  });

  it('delega las consultas de ciudades y cines', async () => {
    service.findCiudades.mockResolvedValue([]);
    service.findCiudadById.mockResolvedValue({ id: 'ciudad-1' });
    service.findCinesByCiudad.mockResolvedValue([]);
    service.findCines.mockResolvedValue([]);
    service.findCineById.mockResolvedValue({ id: 'cine-1' });

    await expect(controller.findCiudades()).resolves.toEqual([]);
    await expect(controller.findCiudadById('ciudad-1')).resolves.toEqual({
      id: 'ciudad-1',
    });
    await expect(controller.findCinesByCiudad('ciudad-1')).resolves.toEqual([]);
    await expect(controller.findCines()).resolves.toEqual([]);
    await expect(controller.findCineById('cine-1')).resolves.toEqual({
      id: 'cine-1',
    });
  });

  it('convierte los parámetros de paginación', () => {
    controller.findCinesPaginated('2', '5', 'cine', 'ciudad-1');

    expect(service.findCinesPaginated).toHaveBeenCalledWith({
      page: 2,
      limit: 5,
      search: 'cine',
      idCiudad: 'ciudad-1',
    });
  });

  it('acepta paginación sin parámetros opcionales', () => {
    controller.findCinesPaginated();

    expect(service.findCinesPaginated).toHaveBeenCalledWith({
      page: undefined,
      limit: undefined,
      search: undefined,
      idCiudad: undefined,
    });
  });

  it('delega las mutaciones de ciudades y cines', () => {
    const ciudad = { nombre: 'Guatemala' };
    const cine = {
      nombre: 'Central',
      direccion: 'Zona 1',
      idCiudad: '11111111-1111-4111-8111-111111111111',
    };

    controller.createCiudad(ciudad);
    controller.createCine(cine);
    controller.updateCine('cine-1', { nombre: 'Nuevo nombre' });
    controller.removeCine('cine-1');

    expect(service.createCiudad).toHaveBeenCalledWith(ciudad);
    expect(service.createCine).toHaveBeenCalledWith(cine);
    expect(service.updateCine).toHaveBeenCalledWith('cine-1', {
      nombre: 'Nuevo nombre',
    });
    expect(service.removeCine).toHaveBeenCalledWith('cine-1');
  });
});
