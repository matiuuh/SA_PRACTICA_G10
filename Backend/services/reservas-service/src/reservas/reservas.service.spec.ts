import { ConflictException, NotFoundException } from '@nestjs/common';
import { ReservasService } from './reservas.service';

const mockEstadoTemporal = { id: 'est-1', nombre: 'TEMPORAL' };
const mockEstadoConfirmada = { id: 'est-2', nombre: 'CONFIRMADA' };
const mockAsiento = { id: 'asiento-1', fila: 'A', numero: 1, idFuncionExterna: 'funcion-1' };
const mockReserva = {
  id: 'reserva-1',
  usuarioIdExterno: 'user-1',
  fechaReserva: new Date(),
  fechaExpiracion: null,
  total: 100,
  estado: mockEstadoTemporal,
  detalles: [{ id: 'det-1', asiento: mockAsiento }],
  boletos: [],
};

describe('ReservasService', () => {
  let service: ReservasService;
  let asientosRepo: Record<string, jest.Mock>;
  let estadosRepo: Record<string, jest.Mock>;
  let reservasRepo: Record<string, jest.Mock>;
  let detallesRepo: Record<string, any>;
  let boletosRepo: Record<string, jest.Mock>;
  let rabbitMqService: Record<string, jest.Mock>;
  let reservasGateway: Record<string, jest.Mock>;

  beforeEach(() => {
    asientosRepo = {
      find: jest.fn().mockResolvedValue([mockAsiento]),
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    estadosRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    reservasRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve({ ...d, id: d.id || 'reserva-new' })),
    };

    const mockQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    detallesRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };

    boletosRepo = {
      findOne: jest.fn(),
      create: jest.fn().mockImplementation((d) => d),
      save: jest.fn().mockImplementation((d) => Promise.resolve(d)),
    };
    rabbitMqService = {
      publishPaymentRequested: jest.fn().mockResolvedValue(undefined),
    };
    reservasGateway = {
      notifySeatAvailabilityChanged: jest.fn(),
      releaseSeatsForReservation: jest.fn(),
    };

    service = new ReservasService(
      asientosRepo as any,
      estadosRepo as any,
      reservasRepo as any,
      detallesRepo as any,
      boletosRepo as any,
      rabbitMqService as any,
      reservasGateway as any,
    );
  });

  afterEach(() => jest.clearAllMocks());

  describe('findReservaById', () => {
    it('debe retornar una reserva por ID', async () => {
      reservasRepo.findOne.mockResolvedValue(mockReserva);
      const result = await service.findReservaById('reserva-1');
      expect(result).toEqual(mockReserva);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      reservasRepo.findOne.mockResolvedValue(null);
      await expect(service.findReservaById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findBoletoById', () => {
    it('debe retornar un boleto por ID', async () => {
      const mockBoleto = { id: 'bol-1', codigoQr: 'BOL-ABC', reserva: mockReserva };
      boletosRepo.findOne.mockResolvedValue(mockBoleto);
      const result = await service.findBoletoById('bol-1');
      expect(result).toEqual(mockBoleto);
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      boletosRepo.findOne.mockResolvedValue(null);
      await expect(service.findBoletoById('no-existe')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createAsiento', () => {
    it('debe crear un asiento nuevo', async () => {
      asientosRepo.findOne.mockResolvedValue(null);
      const result = await service.createAsiento({
        fila: '  A  ',
        numero: 1,
        idFuncionExterna: 'funcion-1',
      });
      expect(result.fila).toBe('A');
      expect(result.numero).toBe(1);
    });

    it('debe lanzar ConflictException si el asiento ya existe', async () => {
      asientosRepo.findOne.mockResolvedValue(mockAsiento);
      await expect(
        service.createAsiento({ fila: 'A', numero: 1, idFuncionExterna: 'funcion-1' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createEstado', () => {
    it('debe crear un estado de reserva nuevo', async () => {
      estadosRepo.findOne.mockResolvedValue(null);
      const result = await service.createEstado({ nombre: '  temporal  ' });
      expect(result.nombre).toBe('TEMPORAL');
    });

    it('debe lanzar ConflictException si el estado ya existe', async () => {
      estadosRepo.findOne.mockResolvedValue(mockEstadoTemporal);
      await expect(service.createEstado({ nombre: 'TEMPORAL' })).rejects.toThrow(ConflictException);
    });
  });

  describe('createReserva', () => {
    it('debe crear una reserva temporal con asientos validos', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      estadosRepo.findOne.mockResolvedValue(mockEstadoTemporal);
      reservasRepo.findOne.mockResolvedValue(mockReserva);

      const result = await service.createReserva({
        usuarioIdExterno: 'user-1',
        asientosIds: ['asiento-1'],
        total: 100,
      });

      expect(reservasRepo.create).toHaveBeenCalled();
      expect(reservasRepo.save).toHaveBeenCalled();
      expect(detallesRepo.save).toHaveBeenCalled();
      expect(result).toEqual(mockReserva);
    });

    it('debe lanzar NotFoundException si algun asiento no existe', async () => {
      asientosRepo.find.mockResolvedValue([]);
      await expect(
        service.createReserva({
          usuarioIdExterno: 'user-1',
          asientosIds: ['asiento-inexistente'],
          total: 50,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar ConflictException si los asientos ya estan reservados', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      const qb = detallesRepo.createQueryBuilder();
      qb.getRawMany.mockResolvedValue([{ id: 'asiento-1' }]);
      estadosRepo.findOne.mockResolvedValue(mockEstadoTemporal);

      await expect(
        service.createReserva({
          usuarioIdExterno: 'user-1',
          asientosIds: ['asiento-1'],
          total: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('confirmReserva', () => {
    it('debe confirmar la reserva y generar boleto', async () => {
      reservasRepo.findOne.mockResolvedValue({ ...mockReserva });
      estadosRepo.findOne.mockResolvedValue(mockEstadoConfirmada);
      boletosRepo.findOne.mockResolvedValue(null);

      const result = await service.confirmReserva('reserva-1');
      expect(reservasRepo.save).toHaveBeenCalled();
      expect(boletosRepo.create).toHaveBeenCalled();
      expect(boletosRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('no debe crear boleto si ya existe uno', async () => {
      reservasRepo.findOne.mockResolvedValue({ ...mockReserva });
      estadosRepo.findOne.mockResolvedValue(mockEstadoConfirmada);
      boletosRepo.findOne.mockResolvedValue({ id: 'bol-existente' });

      await service.confirmReserva('reserva-1');
      expect(boletosRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('rejectReserva', () => {
    it('debe rechazar la reserva y liberar asientos', async () => {
      const estadoRechazada = { id: 'est-3', nombre: 'RECHAZADA' };
      reservasRepo.findOne.mockResolvedValue({ ...mockReserva });
      estadosRepo.findOne.mockResolvedValue(estadoRechazada);

      const result = await service.rejectReserva('reserva-1', 'Pago rechazado');
      expect(reservasRepo.save).toHaveBeenCalled();
      expect(reservasGateway.releaseSeatsForReservation).toHaveBeenCalled();
      expect(reservasGateway.notifySeatAvailabilityChanged).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('findAsientosByFuncion', () => {
    it('debe retornar asientos con estado de ocupacion', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);

      const result = await service.findAsientosByFuncion('funcion-1', 'user-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('ocupado');
      expect(result[0]).toHaveProperty('propio');
    });

    it('debe marcar como propio el asiento reservado por el usuario actual', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      const qb = detallesRepo.createQueryBuilder();
      qb.getRawMany.mockResolvedValue([{ id: 'asiento-1', usuarioIdExterno: 'user-1' }]);

      const result = await service.findAsientosByFuncion('funcion-1', 'user-1');
      expect(result[0].ocupado).toBe(true);
      expect(result[0].propio).toBe(true);
    });

    it('debe marcar ocupado=true pero propio=false si el asiento es de otro usuario', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      const qb = detallesRepo.createQueryBuilder();
      qb.getRawMany.mockResolvedValue([{ id: 'asiento-1', usuarioIdExterno: 'otro-user' }]);

      const result = await service.findAsientosByFuncion('funcion-1', 'user-1');
      expect(result[0].ocupado).toBe(true);
      expect(result[0].propio).toBe(false);
    });
  });

  describe('createCheckout', () => {
    it('debe crear reserva, publicar pago en RabbitMQ y retornar la reserva', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      estadosRepo.findOne.mockResolvedValue(mockEstadoTemporal);
      reservasRepo.findOne.mockResolvedValue(mockReserva);

      const result = await service.createCheckout({
        usuarioIdExterno: 'user-1',
        asientosIds: ['asiento-1'],
        total: 100,
        metodoPago: 'TARJETA',
        numeroTarjeta: '4111111111111111',
        nombreTitular: 'Test User',
        cvv: '123',
        fechaExpiracion: '2027-12-31',
        paypalEmail: 'test@test.com',
      });

      expect(rabbitMqService.publishPaymentRequested).toHaveBeenCalledWith(
        expect.objectContaining({ reservaId: expect.any(String), total: 100 }),
      );
      expect(result).toEqual(mockReserva);
    });

    it('debe generar fecha de expiracion automaticamente si no se proporciona', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      estadosRepo.findOne.mockResolvedValue(mockEstadoTemporal);
      reservasRepo.findOne.mockResolvedValue(mockReserva);

      await service.createCheckout({
        usuarioIdExterno: 'user-1',
        asientosIds: ['asiento-1'],
        total: 100,
        metodoPago: 'PAYPAL',
      });

      expect(rabbitMqService.publishPaymentRequested).toHaveBeenCalledWith(
        expect.objectContaining({ metodoPago: 'PAYPAL' }),
      );
    });
  });

  describe('findOrCreateEstado (cuando no existe)', () => {
    it('debe crear el estado si no existe en la base de datos', async () => {
      asientosRepo.find.mockResolvedValue([mockAsiento]);
      estadosRepo.findOne.mockResolvedValue(null);
      reservasRepo.findOne.mockResolvedValue(mockReserva);

      await service.createReserva({
        usuarioIdExterno: 'user-1',
        asientosIds: ['asiento-1'],
        total: 100,
      });

      expect(estadosRepo.create).toHaveBeenCalled();
      expect(estadosRepo.save).toHaveBeenCalled();
    });
  });

  describe('rejectReserva', () => {
    it('no debe notificar al gateway si la reserva no tiene detalles', async () => {
      const estadoRechazada = { id: 'est-3', nombre: 'RECHAZADA' };
      const reservaSinDetalles = { ...mockReserva, detalles: [], fechaExpiracion: new Date() };
      reservasRepo.findOne.mockResolvedValue(reservaSinDetalles);
      estadosRepo.findOne.mockResolvedValue(estadoRechazada);

      await service.rejectReserva('reserva-1', 'Sin detalles');
      expect(reservasGateway.releaseSeatsForReservation).not.toHaveBeenCalled();
      expect(reservasGateway.notifySeatAvailabilityChanged).not.toHaveBeenCalled();
    });
  });

  describe('confirmReserva', () => {
    it('no debe notificar al gateway si la reserva no tiene detalles', async () => {
      const reservaSinDetalles = { ...mockReserva, detalles: [] };
      reservasRepo.findOne.mockResolvedValue(reservaSinDetalles);
      estadosRepo.findOne.mockResolvedValue(mockEstadoConfirmada);
      boletosRepo.findOne.mockResolvedValue(null);

      await service.confirmReserva('reserva-1');
      expect(reservasGateway.releaseSeatsForReservation).not.toHaveBeenCalled();
      expect(reservasGateway.notifySeatAvailabilityChanged).not.toHaveBeenCalled();
    });
  });
});
