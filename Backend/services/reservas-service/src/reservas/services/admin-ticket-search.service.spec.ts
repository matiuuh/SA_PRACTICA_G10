import { BadRequestException } from '@nestjs/common';
import { Brackets } from 'typeorm';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { AdminTicketSearchService } from './admin-ticket-search.service';

describe('AdminTicketSearchService', () => {
  let service: AdminTicketSearchService;
  let repository: Record<string, jest.Mock>;
  let queryBuilder: Record<string, jest.Mock>;

  beforeEach(() => {
    queryBuilder = {
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    };
    repository = {
      createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
    };
    service = new AdminTicketSearchService(repository as any);
  });

  it('aplica filtros combinados y paginacion', async () => {
    const uuid = '11111111-1111-4111-8111-111111111111';

    await service.search({
      page: 2,
      limit: 5,
      identificador: uuid,
      pelicula: '  Matrix  ',
      estado: EstadoBoleto.VALIDO,
      fechaDesde: '2026-06-01',
      fechaHasta: '2026-06-20',
    });

    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'LOWER(boleto.titulo_pelicula) LIKE :pelicula',
      { pelicula: '%matrix%' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'boleto.estado = :estado',
      { estado: EstadoBoleto.VALIDO },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'boleto.fecha_emision >= :fechaDesde',
      { fechaDesde: '2026-06-01T00:00:00.000Z' },
    );
    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'boleto.fecha_emision < :fechaHasta',
      { fechaHasta: '2026-06-21T00:00:00.000Z' },
    );

    const brackets = queryBuilder.andWhere.mock.calls.find(
      ([argument]) => argument instanceof Brackets,
    )?.[0] as Brackets;
    expect(brackets).toBeDefined();
    (brackets as any).whereFactory(queryBuilder);
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(boleto.codigo_qr) LIKE :identificador',
      { identificador: `%${uuid}%` },
    );
    expect(queryBuilder.orWhere).toHaveBeenCalledWith(
      'boleto.id_boleto = :boletoId',
      { boletoId: uuid },
    );
  });

  it('busca codigos parciales sin tratarlos como UUID', async () => {
    await service.search({ identificador: '  BOL-ABC  ' });

    const brackets = queryBuilder.andWhere.mock.calls.find(
      ([argument]) => argument instanceof Brackets,
    )?.[0] as Brackets;
    (brackets as any).whereFactory(queryBuilder);

    expect(queryBuilder.where).toHaveBeenCalledWith(
      'LOWER(boleto.codigo_qr) LIKE :identificador',
      { identificador: '%bol-abc%' },
    );
    expect(queryBuilder.orWhere).not.toHaveBeenCalled();
  });

  it('rechaza rangos de fechas invertidos', async () => {
    await expect(
      service.search({
        fechaDesde: '2026-06-20',
        fechaHasta: '2026-06-01',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('normaliza paginacion y devuelve resultados mapeados', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([
      [
        {
          id: 'boleto-1',
          codigoQr: 'BOL-001',
          estado: EstadoBoleto.USADO,
          fechaEmision: new Date('2026-06-20T12:00:00Z'),
          reserva: {
            id: 'reserva-1',
            usuarioIdExterno: 'user-1',
            fechaReserva: new Date('2026-06-20T11:00:00Z'),
            total: '75.00',
            detalles: [],
          },
        },
      ],
      1,
    ]);

    const result = await service.search({ page: 0, limit: 100 });

    expect(queryBuilder.skip).toHaveBeenCalledWith(0);
    expect(queryBuilder.take).toHaveBeenCalledWith(50);
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'boleto-1',
        reserva: expect.objectContaining({ total: 75 }),
      }),
    );
    expect(result.meta).toEqual({
      page: 1,
      limit: 50,
      total: 1,
      totalPages: 1,
    });
  });
});
