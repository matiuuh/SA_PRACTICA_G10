import { ConflictException, NotFoundException } from '@nestjs/common';
import { PagosService } from './pagos.service';

const mockMetodo = { id: 'metodo-1', nombre: 'TARJETA' };
const mockEstado = { id: 'estado-1', nombre: 'PENDIENTE' };
const mockPago = {
  id: 'pago-1',
  reservaIdExterna: 'reserva-1',
  monto: 100,
  fechaPago: new Date(),
  metodo: mockMetodo,
  estado: mockEstado,
  transacciones: [],
};

describe('PagosService', () => {
  let service: PagosService;
  let metodosRepo: Record<string, jest.Mock>;
  let estadosRepo: Record<string, jest.Mock>;
  let pagosRepo: Record<string, jest.Mock>;
  let transaccionesRepo: Record<string, jest.Mock>;
  let rabbitMqService: Record<string, jest.Mock>;

  beforeEach(() => {
    metodosRepo = {
      find: jest.fn().mockResolvedValue([mockMetodo]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    estadosRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    pagosRepo = {
      find: jest.fn().mockResolvedValue([mockPago]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ ...d, id: d.id || 'pago-new' })),
    };
    transaccionesRepo = {
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    rabbitMqService = {
      publishPaymentResult: jest.fn().mockResolvedValue(undefined),
    };

    service = new PagosService(
      metodosRepo as any,
      estadosRepo as any,
      pagosRepo as any,
      transaccionesRepo as any,
      rabbitMqService as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findMetodos', () => {
    it('debe retornar lista de metodos de pago', async () => {
      const result = await service.findMetodos();
      expect(result).toEqual([mockMetodo]);
      expect(metodosRepo.find).toHaveBeenCalledWith({ order: { nombre: 'ASC' } });
    });
  });

  describe('findPagosByReserva', () => {
    it('debe retornar pagos de una reserva', async () => {
      const result = await service.findPagosByReserva('reserva-1');
      expect(result).toEqual([mockPago]);
    });
  });

  describe('findPagoById', () => {
    it('debe retornar un pago por ID', async () => {
      pagosRepo.findOne.mockResolvedValue(mockPago);
      const result = await service.findPagoById('pago-1');
      expect(result).toEqual(mockPago);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      pagosRepo.findOne.mockResolvedValue(null);
      await expect(service.findPagoById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createMetodo', () => {
    it('debe crear un metodo de pago nuevo', async () => {
      metodosRepo.findOne.mockResolvedValue(null);
      const result = await service.createMetodo({ nombre: '  paypal  ' });
      expect(result.nombre).toBe('PAYPAL');
    });

    it('debe lanzar ConflictException si ya existe', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      await expect(service.createMetodo({ nombre: 'TARJETA' })).rejects.toThrow(ConflictException);
    });
  });

  describe('createEstado', () => {
    it('debe crear un estado de pago nuevo', async () => {
      estadosRepo.findOne.mockResolvedValue(null);
      const result = await service.createEstado({ nombre: '  aprobado  ' });
      expect(result.nombre).toBe('APROBADO');
    });

    it('debe lanzar ConflictException si ya existe', async () => {
      estadosRepo.findOne.mockResolvedValue(mockEstado);
      await expect(service.createEstado({ nombre: 'PENDIENTE' })).rejects.toThrow(ConflictException);
    });
  });

  describe('createPago', () => {
    it('debe crear un pago con metodo y estado por defecto (PENDIENTE)', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      pagosRepo.findOne.mockResolvedValue(mockPago);

      const result = await service.createPago({
        reservaIdExterna: 'reserva-1',
        monto: 100,
        idMetodo: 'metodo-1',
      });
      expect(pagosRepo.create).toHaveBeenCalled();
      expect(pagosRepo.save).toHaveBeenCalled();
      expect(transaccionesRepo.create).toHaveBeenCalled();
      expect(result).toEqual(mockPago);
    });

    it('debe crear un pago con estado especifico', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValue(mockEstado);
      pagosRepo.findOne.mockResolvedValue(mockPago);

      await service.createPago({
        reservaIdExterna: 'reserva-1',
        monto: 100,
        idMetodo: 'metodo-1',
        idEstado: 'estado-1',
      });
      expect(estadosRepo.findOne).toHaveBeenCalledWith({ where: { id: 'estado-1' } });
    });

    it('debe lanzar NotFoundException si el metodo no existe', async () => {
      metodosRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createPago({ reservaIdExterna: 'r1', monto: 50, idMetodo: 'no-existe' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar NotFoundException si el estado no existe', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValue(null);
      await expect(
        service.createPago({ reservaIdExterna: 'r1', monto: 50, idMetodo: 'metodo-1', idEstado: 'no-existe' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('changeEstado', () => {
    it('debe cambiar el estado de un pago', async () => {
      pagosRepo.findOne.mockResolvedValue({ ...mockPago });
      estadosRepo.findOne.mockResolvedValue({ id: 'estado-2', nombre: 'APROBADO' });

      const result = await service.changeEstado('pago-1', 'APROBADO');
      expect(pagosRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar NotFoundException si el pago no existe', async () => {
      pagosRepo.findOne.mockResolvedValue(null);
      await expect(service.changeEstado('no-existe', 'APROBADO')).rejects.toThrow(NotFoundException);
    });
  });

  describe('processPaymentRequest', () => {
    it('debe aprobar pago con tarjeta valida', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValue(null);
      pagosRepo.findOne.mockResolvedValue(mockPago);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 100,
        metodoPago: 'TARJETA',
        detallesPago: {
          numeroTarjeta: '4111111111111111',
          nombreTitular: 'Juan Perez',
          cvv: '123',
          fechaExpiracion: '12/25',
        },
      });

      expect(rabbitMqService.publishPaymentResult).toHaveBeenCalled();
      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('APROBADO');
    });

    it('debe rechazar pago con tarjeta terminada en 0000', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValue(null);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 100,
        metodoPago: 'TARJETA',
        detallesPago: {
          numeroTarjeta: '4111111111110000',
          nombreTitular: 'Juan Perez',
          cvv: '123',
        },
      });

      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('RECHAZADO');
      expect(publishCall.motivo).toBe('Tarjeta rechazada por simulacion');
    });

    it('debe rechazar pago con datos incompletos de tarjeta', async () => {
      metodosRepo.findOne.mockResolvedValue(mockMetodo);
      estadosRepo.findOne.mockResolvedValue(null);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 100,
        metodoPago: 'TARJETA',
        detallesPago: {
          numeroTarjeta: '411',
          nombreTitular: null,
          cvv: null,
        },
      });

      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('RECHAZADO');
      expect(publishCall.motivo).toBe('Datos incompletos de tarjeta');
    });

    it('debe aprobar pago PayPal valido', async () => {
      const paypalMetodo = { id: 'metodo-2', nombre: 'PAYPAL' };
      metodosRepo.findOne.mockResolvedValue(paypalMetodo);
      estadosRepo.findOne.mockResolvedValue(null);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 50,
        metodoPago: 'PAYPAL',
        detallesPago: {
          paypalEmail: 'juan@paypal.com',
        },
      });

      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('APROBADO');
    });

    it('debe rechazar pago PayPal sin email', async () => {
      const paypalMetodo = { id: 'metodo-2', nombre: 'PAYPAL' };
      metodosRepo.findOne.mockResolvedValue(paypalMetodo);
      estadosRepo.findOne.mockResolvedValue(null);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 50,
        metodoPago: 'PAYPAL',
        detallesPago: {},
      });

      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('RECHAZADO');
      expect(publishCall.motivo).toBe('Cuenta de PayPal no proporcionada');
    });

    it('debe rechazar pago PayPal con email que contiene "fail"', async () => {
      const paypalMetodo = { id: 'metodo-2', nombre: 'PAYPAL' };
      metodosRepo.findOne.mockResolvedValue(paypalMetodo);
      estadosRepo.findOne.mockResolvedValue(null);

      await service.processPaymentRequest({
        reservaId: 'reserva-1',
        usuarioIdExterno: 'user-1',
        total: 50,
        metodoPago: 'PAYPAL',
        detallesPago: {
          paypalEmail: 'fail@paypal.com',
        },
      });

      const publishCall = rabbitMqService.publishPaymentResult.mock.calls[0][0];
      expect(publishCall.estado).toBe('RECHAZADO');
      expect(publishCall.motivo).toBe('Pago PayPal rechazado por simulacion');
    });
  });
});
