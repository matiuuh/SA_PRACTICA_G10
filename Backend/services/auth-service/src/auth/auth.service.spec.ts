import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

jest.mock('bcrypt');

const mockUser: User = {
  id: 'user-uuid-1',
  nombre: 'Juan Perez',
  correo: 'juan@test.com',
  passwordHash: '$2b$10$hashedpassword',
  rol: { id: 'role-uuid-1', nombre: 'CLIENTE', usuarios: [] },
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  beforeEach(() => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'JWT_SECRET') return 'test-secret';
        if (key === 'JWT_EXPIRES_IN') return '1h';
        return defaultValue;
      }),
    };

    authService = new AuthService(
      usersService as unknown as UsersService,
      jwtService as unknown as JwtService,
      configService as unknown as ConfigService,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('debe registrar un usuario nuevo y devolver access_token', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-pw');
      usersService.create!.mockResolvedValue(mockUser);

      const result = await authService.register({
        nombre: 'Juan Perez',
        correo: 'juan@test.com',
        password: 'password123',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('juan@test.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalled();
      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.correo).toBe('juan@test.com');
      expect(result.user.rol).toBe('CLIENTE');
    });

    it('debe lanzar ConflictException si el correo ya existe', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);

      await expect(
        authService.register({
          nombre: 'Juan',
          correo: 'juan@test.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('debe autenticar y devolver access_token con credenciales validas', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login({
        correo: 'juan@test.com',
        password: 'password123',
      });

      expect(result.access_token).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-uuid-1');
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.login({ correo: 'noexiste@test.com', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login({ correo: 'juan@test.com', password: 'wrongpass' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateUser', () => {
    it('debe retornar el usuario si las credenciales son validas', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('juan@test.com', 'password123');
      expect(result).toEqual(mockUser);
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        authService.validateUser('noexiste@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si la contrasena no coincide', async () => {
      usersService.findByEmail!.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('juan@test.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getJwtConfig', () => {
    it('debe retornar la configuracion del JWT', () => {
      const config = authService.getJwtConfig();
      expect(config.secret).toBe('test-secret');
      expect(config.signOptions.expiresIn).toBe('1h');
    });
  });
});
