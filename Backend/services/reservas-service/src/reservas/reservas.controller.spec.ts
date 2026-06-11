import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ReservasController } from './reservas.controller';

const mockService = {
  findAsientosByFuncion: jest.fn(),
  findBoletoById: jest.fn(),
  findReservaById: jest.fn(),
  createAsiento: jest.fn(),
  createEstado: jest.fn(),
  createReserva: jest.fn(),
  createCheckout: jest.fn(),
  confirmReserva: jest.fn(),
};

const mockUser = { id: 'user-1', rol: 'CLIENTE' };
const mockAdminUser = { id: 'admin-1', rol: 'ADMINISTRADOR' };
const buildRequest = (user: any) => ({ user });

describe('ReservasController', () => {
  let controller: ReservasController;

  beforeEach(() => {
    controller = new ReservasController(mockService as any);
    jest.clearAllMocks();
  });

  describe('health', () => {
    it('debe retornar status ok con nombre del servicio', () => {
      const result = controller.health();
      expect(result.status).toBe('ok');
      expect(result.service).toBe('reservas-service');
      expect(result.timestamp).toBeDefined();
    });
  });

  describe('findAsientosByFuncion', () => {
    it('debe llamar al servicio con el id de funcion y usuario autenticado', () => {
      mockService.findAsientosByFuncion.mockResolvedValue([]);
      controller.findAsientosByFuncion('funcion-1', buildRequest(mockUser));
      expect(mockService.findAsientosByFuncion).toHaveBeenCalledWith('funcion-1', 'user-1');
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      expect(() =>
        controller.findAsientosByFuncion('funcion-1', buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });

    it('debe lanzar UnauthorizedException si el usuario no tiene id', () => {
      expect(() =>
        controller.findAsientosByFuncion('funcion-1', buildRequest({})),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('findBoleto', () => {
    const mockBoleto = { id: 'bol-1', reserva: { usuarioIdExterno: 'user-1' } };

    it('debe retornar el boleto si el usuario es el propietario', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const result = await controller.findBoleto('bol-1', buildRequest(mockUser));
      expect(result).toEqual(mockBoleto);
    });

    it('debe retornar el boleto si el usuario es ADMINISTRADOR aunque no sea propietario', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const result = await controller.findBoleto('bol-1', buildRequest(mockAdminUser));
      expect(result).toEqual(mockBoleto);
    });

    it('debe lanzar ForbiddenException si el usuario no es propietario ni admin', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      const otherUser = { id: 'other-user', rol: 'CLIENTE' };
      await expect(
        controller.findBoleto('bol-1', buildRequest(otherUser)),
      ).rejects.toThrow(ForbiddenException);
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', async () => {
      mockService.findBoletoById.mockResolvedValue(mockBoleto);
      await expect(
        controller.findBoleto('bol-1', buildRequest(undefined)),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findReserva', () => {
    const mockReserva = { id: 'res-1', usuarioIdExterno: 'user-1' };

    it('debe retornar la reserva si el usuario es el propietario', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const result = await controller.findReserva('res-1', buildRequest(mockUser));
      expect(result).toEqual(mockReserva);
    });

    it('debe retornar la reserva si el usuario es ADMINISTRADOR', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const result = await controller.findReserva('res-1', buildRequest(mockAdminUser));
      expect(result).toEqual(mockReserva);
    });

    it('debe lanzar ForbiddenException si el usuario no es propietario ni admin', async () => {
      mockService.findReservaById.mockResolvedValue(mockReserva);
      const otherUser = { id: 'other-user', rol: 'CLIENTE' };
      await expect(
        controller.findReserva('res-1', buildRequest(otherUser)),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createAsiento', () => {
    it('debe delegar al servicio con el dto recibido', () => {
      const dto = { fila: 'A', numero: 1, idFuncionExterna: 'funcion-1' };
      mockService.createAsiento.mockResolvedValue({ id: 'asiento-1', ...dto });
      controller.createAsiento(dto);
      expect(mockService.createAsiento).toHaveBeenCalledWith(dto);
    });
  });

  describe('createEstado', () => {
    it('debe delegar al servicio con el dto recibido', () => {
      const dto = { nombre: 'TEMPORAL' };
      mockService.createEstado.mockResolvedValue({ id: 'est-1', ...dto });
      controller.createEstado(dto);
      expect(mockService.createEstado).toHaveBeenCalledWith(dto);
    });
  });

  describe('createReserva', () => {
    it('debe llamar al servicio incluyendo el id del usuario autenticado', () => {
      const dto = { asientosIds: ['a-1'], total: 100 };
      mockService.createReserva.mockResolvedValue({ id: 'res-1' });
      controller.createReserva(dto as any, buildRequest(mockUser));
      expect(mockService.createReserva).toHaveBeenCalledWith({
        ...dto,
        usuarioIdExterno: 'user-1',
      });
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      const dto = { asientosIds: ['a-1'], total: 100 };
      expect(() =>
        controller.createReserva(dto as any, buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('createCheckout', () => {
    it('debe llamar al servicio incluyendo el id del usuario autenticado', () => {
      const dto = { asientosIds: ['a-1'], total: 100, idFuncionExterna: 'funcion-1' };
      mockService.createCheckout.mockResolvedValue({ id: 'res-1' });
      controller.createCheckout(dto as any, buildRequest(mockUser));
      expect(mockService.createCheckout).toHaveBeenCalledWith({
        ...dto,
        usuarioIdExterno: 'user-1',
      });
    });

    it('debe lanzar UnauthorizedException si no hay usuario en el request', () => {
      const dto = { asientosIds: ['a-1'], total: 100, idFuncionExterna: 'funcion-1' };
      expect(() =>
        controller.createCheckout(dto as any, buildRequest(undefined)),
      ).toThrow(UnauthorizedException);
    });
  });

  describe('confirmReserva', () => {
    it('debe llamar al servicio con el id de la reserva', () => {
      mockService.confirmReserva.mockResolvedValue({ id: 'res-1' });
      controller.confirmReserva('res-1');
      expect(mockService.confirmReserva).toHaveBeenCalledWith('res-1');
    });
  });
});
