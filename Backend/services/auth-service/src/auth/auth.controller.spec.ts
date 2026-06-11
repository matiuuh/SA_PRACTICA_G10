import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<Partial<AuthService>>;

  beforeEach(() => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    controller = new AuthController(authService as unknown as AuthService);
  });

  describe('register', () => {
    it('debe delegar al servicio de auth', async () => {
      const dto = { nombre: 'Juan', correo: 'juan@test.com', password: '123456' };
      const response = {
        access_token: 'token',
        user: { id: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'CLIENTE' },
      };
      authService.register!.mockResolvedValue(response);

      const result = await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('login', () => {
    it('debe delegar al servicio de auth', async () => {
      const dto = { correo: 'juan@test.com', password: '123456' };
      const response = {
        access_token: 'token',
        user: { id: '1', nombre: 'Juan', correo: 'juan@test.com', rol: 'CLIENTE' },
      };
      authService.login!.mockResolvedValue(response);

      const result = await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('health', () => {
    it('debe retornar status ok', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('auth-service');
    });
  });

  describe('profile', () => {
    it('debe retornar el usuario del request', () => {
      const user = { id: '1', name: 'Juan' };
      const result = controller.profile({ user });
      expect(result).toEqual(user);
    });
  });
});
