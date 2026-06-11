import { NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';

const mockRole: Role = { id: 'role-uuid-1', nombre: 'CLIENTE', usuarios: [] };
const mockUser: User = {
  id: 'user-uuid-1',
  nombre: 'Juan Perez',
  correo: 'juan@test.com',
  passwordHash: 'hashed-pw',
  rol: mockRole,
};

describe('UsersService', () => {
  let service: UsersService;
  let usersRepo: Record<string, jest.Mock>;
  let rolesRepo: Record<string, jest.Mock>;
  let configService: Record<string, jest.Mock>;

  beforeEach(() => {
    usersRepo = {
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockResolvedValue(mockUser),
      findOne: jest.fn(),
    };

    rolesRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((data) => data),
      save: jest.fn().mockImplementation((data) => Promise.resolve(data)),
    };

    configService = {
      get: jest.fn().mockReturnValue('CLIENTE'),
    };

    service = new UsersService(
      usersRepo as any,
      rolesRepo as any,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('create', () => {
    it('debe crear un usuario con rol existente', async () => {
      rolesRepo.findOne.mockResolvedValue(mockRole);

      const result = await service.create({
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        passwordHash: 'hashed-pw',
      });

      expect(rolesRepo.findOne).toHaveBeenCalledWith({ where: { nombre: 'CLIENTE' } });
      expect(usersRepo.create).toHaveBeenCalled();
      expect(usersRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockUser);
    });

    it('debe crear un rol nuevo si no existe', async () => {
      rolesRepo.findOne.mockResolvedValue(null);
      rolesRepo.save.mockResolvedValue(mockRole);

      await service.create({
        nombre: 'Juan',
        correo: 'juan@test.com',
        passwordHash: 'hashed-pw',
      });

      expect(rolesRepo.create).toHaveBeenCalled();
      expect(rolesRepo.save).toHaveBeenCalled();
    });

    it('debe usar el rol proporcionado en el DTO', async () => {
      const adminRole = { id: 'role-uuid-2', nombre: 'ADMINISTRADOR', usuarios: [] };
      rolesRepo.findOne.mockResolvedValue(adminRole);

      await service.create({
        nombre: 'Admin',
        correo: 'admin@test.com',
        passwordHash: 'hashed-pw',
        rol: 'ADMINISTRADOR',
      });

      expect(rolesRepo.findOne).toHaveBeenCalledWith({ where: { nombre: 'ADMINISTRADOR' } });
    });
  });

  describe('findByEmail', () => {
    it('debe retornar un usuario por correo', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('juan@test.com');
      expect(result).toEqual(mockUser);
      expect(usersRepo.findOne).toHaveBeenCalledWith({
        where: { correo: 'juan@test.com' },
        relations: ['rol'],
      });
    });

    it('debe retornar null si el usuario no existe', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('noexiste@test.com');
      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('debe retornar un usuario por id', async () => {
      usersRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.findById('user-uuid-1');
      expect(result).toEqual(mockUser);
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      usersRepo.findOne.mockResolvedValue(null);

      await expect(service.findById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });
});
