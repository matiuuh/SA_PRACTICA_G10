import { BadRequestException } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { TicketHistoryService } from './ticket-history.service';

describe('TicketHistoryService', () => {
  let service: TicketHistoryService;
  let repository: Record<string, jest.Mock>;
  let dataQuery: Record<string, jest.Mock>;
  let statusQuery: Record<string, jest.Mock>;

  const createQuery = () => ({
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  });

  beforeEach(() => {
    dataQuery = createQuery();
    statusQuery = createQuery();
    repository = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(dataQuery)
        .mockReturnValueOnce(statusQuery),
    };
    service = new TicketHistoryService(repository as any);
  });

  it('devuelve historial paginado con conteos globales por estado', async () => {
    dataQuery.getManyAndCount.mockResolvedValue([
      [
        {
          id: 'boleto-1',
          codigoQr: 'BOL-001',
          estado: EstadoBoleto.VALIDO,
          fechaEmision: new Date('2026-06-20T12:00:00Z'),
          fechaUso: null,
          idFuncionExterna: 'funcion-1',
          idPeliculaExterna: 'pelicula-1',
          tituloPelicula: 'Pelicula',
          fechaFuncion: '2026-06-22',
          horaFuncion: '18:30:00',
          salaNombre: 'Sala 1',
          reserva: {
            id: 'reserva-1',
            usuarioIdExterno: 'user-1',
            fechaReserva: new Date('2026-06-20T11:55:00Z'),
            total: '150.50',
            detalles: [],
          },
        },
      ],
      11,
    ]);
    statusQuery.getRawMany.mockResolvedValue([
      { estado: EstadoBoleto.VALIDO, total: '8' },
      { estado: EstadoBoleto.USADO, total: '3' },
    ]);

    const result = await service.findByUser('user-1', { page: 2, limit: 10 });

    expect(dataQuery.andWhere).toHaveBeenCalledWith(
      'reserva.usuario_id_externo = :usuarioId',
      { usuarioId: 'user-1' },
    );
    expect(dataQuery.skip).toHaveBeenCalledWith(10);
    expect(dataQuery.take).toHaveBeenCalledWith(10);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
      totalsByStatus: { validos: 8, usados: 3 },
    });
  });

  it('aplica búsqueda, estado y rango de fechas', async () => {
    await service.findByUser('user-1', {
      identificador: ' Matrix ',
      estado: EstadoBoleto.USADO,
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-20',
    });

    expect(dataQuery.andWhere).toHaveBeenCalledWith(
      'boleto.estado = :estado',
      { estado: EstadoBoleto.USADO },
    );
    expect(dataQuery.andWhere).toHaveBeenCalledWith(
      'boleto.fecha_emision >= :fechaDesde',
      { fechaDesde: '2026-06-01T00:00:00.000Z' },
    );
    expect(dataQuery.andWhere).toHaveBeenCalledWith(
      'boleto.fecha_emision < :fechaHasta',
      { fechaHasta: '2026-06-21T00:00:00.000Z' },
    );

    const brackets = dataQuery.andWhere.mock.calls.find(
      ([argument]) => argument instanceof Brackets,
    )?.[0] as Brackets;
    expect(brackets).toBeDefined();
    (brackets as any).whereFactory(dataQuery);
    expect(dataQuery.where).toHaveBeenCalledWith(
      'LOWER(boleto.codigo_qr) LIKE :identificador',
      { identificador: '%matrix%' },
    );
    expect(dataQuery.orWhere).toHaveBeenCalledWith(
      'LOWER(boleto.titulo_pelicula) LIKE :identificador',
      { identificador: '%matrix%' },
    );
  });

  it('rechaza rangos de fechas invertidos', async () => {
    await expect(
      service.findByUser('user-1', {
        fechaDesde: '2026-06-20',
        fechaHasta: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('normaliza la paginación', async () => {
    const result = await service.findByUser('user-1', {
      page: 0,
      limit: 100,
    });

    expect(dataQuery.skip).toHaveBeenCalledWith(0);
    expect(dataQuery.take).toHaveBeenCalledWith(50);
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(50);
  });
});
