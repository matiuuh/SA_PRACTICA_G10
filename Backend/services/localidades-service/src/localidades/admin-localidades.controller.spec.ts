import { AdminLocalidadesController } from './admin-localidades.controller';
import { LocalidadesService } from './localidades.service';

describe('AdminLocalidadesController', () => {
  let controller: AdminLocalidadesController;
  let service: Record<string, jest.Mock>;

  beforeEach(() => {
    service = {
      createCiudad: jest.fn(),
      updateCiudad: jest.fn(),
      removeCiudad: jest.fn(),
      createCine: jest.fn(),
      updateCine: jest.fn(),
      removeCine: jest.fn(),
      createSala: jest.fn(),
      updateSala: jest.fn(),
      removeSala: jest.fn(),
    };

    controller = new AdminLocalidadesController(service as unknown as LocalidadesService);
  });

  afterEach(() => jest.clearAllMocks());

  it('createCiudad delega al service con el dto', async () => {
    const dto = { nombre: 'Guatemala' };
    service.createCiudad.mockResolvedValue(dto);

    await expect(controller.createCiudad(dto as any)).resolves.toEqual(dto);
    expect(service.createCiudad).toHaveBeenCalledWith(dto);
  });

  it('updateCiudad delega al service con id y dto', async () => {
    const dto = { nombre: 'Antigua' };
    service.updateCiudad.mockResolvedValue({ id: 'c1', ...dto });

    await expect(controller.updateCiudad('c1', dto as any)).resolves.toEqual({ id: 'c1', ...dto });
    expect(service.updateCiudad).toHaveBeenCalledWith('c1', dto);
  });

  it('removeCiudad delega al service con el id', async () => {
    service.removeCiudad.mockResolvedValue(undefined);

    await expect(controller.removeCiudad('c1')).resolves.toBeUndefined();
    expect(service.removeCiudad).toHaveBeenCalledWith('c1');
  });

  it('createCine delega al service con el dto', async () => {
    const dto = { nombre: 'Cine', direccion: 'Zona 1', idCiudad: 'c1' };
    service.createCine.mockResolvedValue(dto);

    await expect(controller.createCine(dto as any)).resolves.toEqual(dto);
    expect(service.createCine).toHaveBeenCalledWith(dto);
  });

  it('updateCine delega al service con id y dto', async () => {
    const dto = { nombre: 'Cine 2' };
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

  it('createSala delega al service con el dto', async () => {
    const dto = { nombre: 'Sala 1', capacidad: 100, idCine: 'cine-1' };
    service.createSala.mockResolvedValue(dto);

    await expect(controller.createSala(dto as any)).resolves.toEqual(dto);
    expect(service.createSala).toHaveBeenCalledWith(dto);
  });

  it('updateSala delega al service con id y dto', async () => {
    const dto = { nombre: 'Sala VIP', capacidad: 80 };
    service.updateSala.mockResolvedValue({ id: 'sala-1', ...dto });

    await expect(controller.updateSala('sala-1', dto as any)).resolves.toEqual({
      id: 'sala-1',
      ...dto,
    });
    expect(service.updateSala).toHaveBeenCalledWith('sala-1', dto);
  });

  it('removeSala delega al service con el id', async () => {
    service.removeSala.mockResolvedValue(undefined);

    await expect(controller.removeSala('sala-1')).resolves.toBeUndefined();
    expect(service.removeSala).toHaveBeenCalledWith('sala-1');
  });
});
