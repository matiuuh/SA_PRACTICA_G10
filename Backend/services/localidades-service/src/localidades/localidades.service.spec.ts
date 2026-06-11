import { NotFoundException } from '@nestjs/common';
import { LocalidadesService } from './localidades.service';

const mockCiudad = { id: 'ciudad-1', nombre: 'Guatemala' };
const mockCine = { id: 'cine-1', nombre: 'Cinepolis Miraflores', direccion: 'Zona 11', ciudad: mockCiudad };
const mockSala = { id: 'sala-1', nombre: 'Sala 1', capacidad: 100, tipoSala: 'IMAX', cine: mockCine };

describe('LocalidadesService', () => {
  let service: LocalidadesService;
  let ciudadesRepo: Record<string, jest.Mock>;
  let cinesRepo: Record<string, jest.Mock>;
  let salasRepo: Record<string, jest.Mock>;

  beforeEach(() => {
    ciudadesRepo = {
      find: jest.fn().mockResolvedValue([mockCiudad]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    cinesRepo = {
      find: jest.fn().mockResolvedValue([mockCine]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      remove: jest.fn().mockResolvedValue(undefined),
    };
    salasRepo = {
      find: jest.fn().mockResolvedValue([mockSala]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
      remove: jest.fn().mockResolvedValue(undefined),
    };

    service = new LocalidadesService(
      ciudadesRepo as any,
      cinesRepo as any,
      salasRepo as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  // ─── Ciudades ─────────────────────────────────────────────────────

  describe('findCiudades', () => {
    it('debe retornar lista de ciudades', async () => {
      const result = await service.findCiudades();
      expect(result).toEqual([mockCiudad]);
      expect(ciudadesRepo.find).toHaveBeenCalledWith({ order: { nombre: 'ASC' } });
    });
  });

  describe('findCiudadById', () => {
    it('debe retornar una ciudad por ID', async () => {
      ciudadesRepo.findOne.mockResolvedValue(mockCiudad);
      const result = await service.findCiudadById('ciudad-1');
      expect(result).toEqual(mockCiudad);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      await expect(service.findCiudadById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCiudad', () => {
    it('debe crear una ciudad con nombre trimmeado', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      const result = await service.createCiudad({ nombre: '  Guatemala  ' });
      expect(result.nombre).toBe('Guatemala');
      expect(ciudadesRepo.save).toHaveBeenCalled();
    });
  });

  describe('updateCiudad', () => {
    it('debe actualizar el nombre de la ciudad', async () => {
      ciudadesRepo.findOne.mockResolvedValue({ ...mockCiudad });
      const result = await service.updateCiudad('ciudad-1', { nombre: '  Quetzaltenango  ' });
      expect(result.nombre).toBe('Quetzaltenango');
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      await expect(service.updateCiudad('no-existe', { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeCiudad', () => {
    it('debe eliminar una ciudad existente', async () => {
      ciudadesRepo.findOne.mockResolvedValue(mockCiudad);
      await service.removeCiudad('ciudad-1');
      expect(ciudadesRepo.remove).toHaveBeenCalledWith(mockCiudad);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      await expect(service.removeCiudad('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  // ─── Cines ────────────────────────────────────────────────────────

  describe('findCines', () => {
    it('debe retornar lista de cines', async () => {
      const result = await service.findCines();
      expect(result).toEqual([mockCine]);
    });
  });

  describe('findCineById', () => {
    it('debe retornar un cine por ID', async () => {
      cinesRepo.findOne.mockResolvedValue(mockCine);
      const result = await service.findCineById('cine-1');
      expect(result).toEqual(mockCine);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      cinesRepo.findOne.mockResolvedValue(null);
      await expect(service.findCineById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findCinesByCiudad', () => {
    it('debe retornar cines de una ciudad', async () => {
      ciudadesRepo.findOne.mockResolvedValue(mockCiudad);
      const result = await service.findCinesByCiudad('ciudad-1');
      expect(result).toEqual([mockCine]);
    });

    it('debe lanzar NotFoundException si la ciudad no existe', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      await expect(service.findCinesByCiudad('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCine', () => {
    it('debe crear un cine asociado a una ciudad', async () => {
      ciudadesRepo.findOne.mockResolvedValue(mockCiudad);
      const result = await service.createCine({
        nombre: '  Cinepolis  ',
        direccion: '  Zona 11  ',
        idCiudad: 'ciudad-1',
      });
      expect(result.nombre).toBe('Cinepolis');
      expect(result.direccion).toBe('Zona 11');
      expect(result.ciudad).toEqual(mockCiudad);
    });

    it('debe lanzar NotFoundException si la ciudad no existe', async () => {
      ciudadesRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createCine({ nombre: 'X', direccion: 'Y', idCiudad: 'no-existe' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateCine', () => {
    it('debe actualizar nombre, direccion y ciudad del cine', async () => {
      cinesRepo.findOne.mockResolvedValue({ ...mockCine });
      ciudadesRepo.findOne.mockResolvedValue(mockCiudad);

      const result = await service.updateCine('cine-1', {
        nombre: '  Nuevo Nombre  ',
        direccion: '  Nueva Dir  ',
        idCiudad: 'ciudad-1',
      });
      expect(result.nombre).toBe('Nuevo Nombre');
      expect(result.direccion).toBe('Nueva Dir');
    });

    it('debe lanzar NotFoundException si el cine no existe', async () => {
      cinesRepo.findOne.mockResolvedValue(null);
      await expect(service.updateCine('no-existe', { nombre: 'X' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeCine', () => {
    it('debe eliminar un cine existente', async () => {
      cinesRepo.findOne.mockResolvedValue(mockCine);
      await service.removeCine('cine-1');
      expect(cinesRepo.remove).toHaveBeenCalledWith(mockCine);
    });
  });

  // ─── Salas ────────────────────────────────────────────────────────

  describe('findSalas', () => {
    it('debe retornar todas las salas', async () => {
      const result = await service.findSalas();
      expect(result).toEqual([mockSala]);
    });
  });

  describe('findSalasByCine', () => {
    it('debe retornar salas de un cine', async () => {
      cinesRepo.findOne.mockResolvedValue(mockCine);
      const result = await service.findSalasByCine('cine-1');
      expect(result).toEqual([mockSala]);
    });

    it('debe lanzar NotFoundException si el cine no existe', async () => {
      cinesRepo.findOne.mockResolvedValue(null);
      await expect(service.findSalasByCine('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findSalaById', () => {
    it('debe retornar una sala por ID', async () => {
      salasRepo.findOne.mockResolvedValue(mockSala);
      const result = await service.findSalaById('sala-1');
      expect(result).toEqual(mockSala);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      salasRepo.findOne.mockResolvedValue(null);
      await expect(service.findSalaById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createSala', () => {
    it('debe crear una sala asociada a un cine', async () => {
      cinesRepo.findOne.mockResolvedValue(mockCine);
      const result = await service.createSala({
        nombre: '  Sala VIP  ',
        capacidad: 50,
        tipoSala: '  3D  ',
        idCine: 'cine-1',
      });
      expect(result.nombre).toBe('Sala VIP');
      expect(result.tipoSala).toBe('3D');
      expect(result.capacidad).toBe(50);
    });

    it('debe manejar tipoSala undefined (null)', async () => {
      cinesRepo.findOne.mockResolvedValue(mockCine);
      const result = await service.createSala({
        nombre: 'Sala Normal',
        capacidad: 80,
        idCine: 'cine-1',
      });
      expect(result.tipoSala).toBeNull();
    });
  });

  describe('updateSala', () => {
    it('debe actualizar campos de la sala', async () => {
      salasRepo.findOne.mockResolvedValue({ ...mockSala });
      cinesRepo.findOne.mockResolvedValue(mockCine);

      const result = await service.updateSala('sala-1', {
        nombre: '  Sala Renovada  ',
        capacidad: 120,
        tipoSala: '  4DX  ',
        idCine: 'cine-1',
      });
      expect(result.nombre).toBe('Sala Renovada');
      expect(result.capacidad).toBe(120);
      expect(result.tipoSala).toBe('4DX');
    });

    it('debe manejar tipoSala undefined sin cambiar', async () => {
      salasRepo.findOne.mockResolvedValue({ ...mockSala });
      const result = await service.updateSala('sala-1', {});
      expect(result.tipoSala).toBe('IMAX');
    });

    it('debe lanzar NotFoundException si la sala no existe', async () => {
      salasRepo.findOne.mockResolvedValue(null);
      await expect(service.updateSala('no-existe', {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeSala', () => {
    it('debe eliminar una sala existente', async () => {
      salasRepo.findOne.mockResolvedValue(mockSala);
      await service.removeSala('sala-1');
      expect(salasRepo.remove).toHaveBeenCalledWith(mockSala);
    });

    it('debe lanzar NotFoundException si la sala no existe', async () => {
      salasRepo.findOne.mockResolvedValue(null);
      await expect(service.removeSala('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
