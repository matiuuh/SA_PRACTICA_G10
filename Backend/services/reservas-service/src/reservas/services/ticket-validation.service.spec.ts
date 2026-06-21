import { ConflictException, NotFoundException } from '@nestjs/common';
import { EstadoAsiento } from '../enums/estado-asiento.enum';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { TicketValidationService } from './ticket-validation.service';

describe('TicketValidationService', () => {
  let service: TicketValidationService;
  let dataSource: Record<string, jest.Mock>;
  let gateway: Record<string, jest.Mock>;
  let manager: Record<string, jest.Mock>;
  let ticketRepository: Record<string, jest.Mock>;
  let reservaRepository: Record<string, jest.Mock>;
  let asientoRepository: Record<string, jest.Mock>;
  let queryBuilder: Record<string, jest.Mock>;

  const asiento = {
    id: 'asiento-1',
    fila: 'A',
    numero: 1,
    idFuncionExterna: 'funcion-1',
    estado: EstadoAsiento.RESERVADO,
  };
  const reserva = {
    id: 'reserva-1',
    usuarioIdExterno: 'user-1',
    fechaReserva: new Date('2026-06-20T10:00:00Z'),
    total: 100,
    detalles: [{ id: 'detalle-1', asiento }],
  };
  const boleto = {
    id: 'boleto-1',
    codigoQr: 'BOL-001',
    estado: EstadoBoleto.VALIDO,
    fechaEmision: new Date('2026-06-20T10:05:00Z'),
    fechaUso: null,
    validadoPor: null,
    idFuncionExterna: 'funcion-1',
    reserva: { id: 'reserva-1' },
  };

  beforeEach(() => {
    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      setLock: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ ...boleto }),
    };
    ticketRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
      save: jest.fn().mockImplementation(async (value) => value),
    };
    reservaRepository = {
      findOne: jest.fn().mockResolvedValue({
        ...reserva,
        detalles: [{ id: 'detalle-1', asiento: { ...asiento } }],
      }),
    };
    asientoRepository = {
      save: jest.fn().mockImplementation(async (value) => value),
    };
    manager = {
      getRepository: jest.fn((entity) => {
        if (entity.name === 'Boleto') return ticketRepository;
        if (entity.name === 'Reserva') return reservaRepository;
        return asientoRepository;
      }),
    };
    dataSource = {
      transaction: jest.fn(async (callback) => callback(manager)),
    };
    gateway = {
      notifySeatAvailabilityChanged: jest.fn(),
    };
    service = new TicketValidationService(
      dataSource as any,
      gateway as any,
    );
  });

  it('valida por codigo dentro de una transaccion y marca asientos EN_USO', async () => {
    const result = await service.validateByCode('  bol-001  ', 'admin-1');

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(queryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'UPPER(boleto.codigo_qr) = UPPER(:codigo)',
      { codigo: 'bol-001' },
    );
    expect(asientoRepository.save).toHaveBeenCalledWith([
      expect.objectContaining({ estado: EstadoAsiento.EN_USO }),
    ]);
    expect(ticketRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        estado: EstadoBoleto.USADO,
        validadoPor: 'admin-1',
        fechaUso: expect.any(Date),
      }),
    );
    expect(gateway.notifySeatAvailabilityChanged).toHaveBeenCalledWith(
      'funcion-1',
    );
    expect(result.estado).toBe(EstadoBoleto.USADO);
  });

  it('valida manualmente por UUID', async () => {
    await service.validateManually(
      '11111111-1111-4111-8111-111111111111',
      'admin-1',
    );

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'boleto.id_boleto = :ticketId',
      { ticketId: '11111111-1111-4111-8111-111111111111' },
    );
  });

  it('rechaza un boleto inexistente', async () => {
    queryBuilder.getOne.mockResolvedValue(null);

    await expect(
      service.validateByCode('BOL-NO-EXISTE', 'admin-1'),
    ).rejects.toThrow(NotFoundException);
    expect(ticketRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza un boleto que ya fue utilizado después de adquirir el bloqueo', async () => {
    queryBuilder.getOne.mockResolvedValue({
      ...boleto,
      estado: EstadoBoleto.USADO,
    });

    await expect(
      service.validateByCode('BOL-001', 'admin-1'),
    ).rejects.toThrow(ConflictException);
    expect(ticketRepository.save).not.toHaveBeenCalled();
  });

  it('rechaza un boleto sin reserva asociada', async () => {
    reservaRepository.findOne.mockResolvedValue(null);

    await expect(
      service.validateByCode('BOL-001', 'admin-1'),
    ).rejects.toThrow(NotFoundException);
  });

  it('valida boletos sin asientos y sin id historico de funcion', async () => {
    queryBuilder.getOne.mockResolvedValue({
      ...boleto,
      idFuncionExterna: null,
    });
    reservaRepository.findOne.mockResolvedValue({
      ...reserva,
      detalles: [],
    });

    await service.validateByCode('BOL-001', 'admin-1');

    expect(asientoRepository.save).not.toHaveBeenCalled();
    expect(gateway.notifySeatAvailabilityChanged).not.toHaveBeenCalled();
  });

  it('usa la funcion del asiento cuando el snapshot historico no la tiene', async () => {
    queryBuilder.getOne.mockResolvedValue({
      ...boleto,
      idFuncionExterna: null,
    });

    await service.validateByCode('BOL-001', 'admin-1');

    expect(gateway.notifySeatAvailabilityChanged).toHaveBeenCalledWith(
      'funcion-1',
    );
  });
});
