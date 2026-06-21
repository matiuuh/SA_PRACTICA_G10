import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { TicketHistoryService } from './ticket-history.service';

describe('TicketHistoryService', () => {
  let service: TicketHistoryService;
  let boletosRepository: Record<string, jest.Mock>;

  beforeEach(() => {
    boletosRepository = {
      findAndCount: jest.fn(),
    };
    service = new TicketHistoryService(boletosRepository as any);
  });

  it('devuelve el historial paginado y ordena los asientos', async () => {
    const fechaEmision = new Date('2026-06-20T12:00:00Z');
    const fechaReserva = new Date('2026-06-20T11:55:00Z');
    boletosRepository.findAndCount.mockResolvedValue([
      [
        {
          id: 'boleto-1',
          codigoQr: 'BOL-001',
          estado: EstadoBoleto.VALIDO,
          fechaEmision,
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
            fechaReserva,
            total: '150.50',
            detalles: [
              {
                asiento: {
                  id: 'asiento-2',
                  fila: 'B',
                  numero: 2,
                },
              },
              {
                asiento: {
                  id: 'asiento-1',
                  fila: 'A',
                  numero: 1,
                },
              },
            ],
          },
        },
      ],
      11,
    ]);

    const result = await service.findByUser('user-1', 2, 10);

    expect(boletosRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { reserva: { usuarioIdExterno: 'user-1' } },
        skip: 10,
        take: 10,
      }),
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        id: 'boleto-1',
        reserva: expect.objectContaining({ total: 150.5 }),
        funcion: {
          id: 'funcion-1',
          fecha: '2026-06-22',
          hora: '18:30:00',
          sala: 'Sala 1',
        },
        pelicula: {
          id: 'pelicula-1',
          titulo: 'Pelicula',
        },
      }),
    );
    expect(result.data[0].asientos.map((asiento) => asiento.id)).toEqual([
      'asiento-1',
      'asiento-2',
    ]);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 11,
      totalPages: 2,
    });
  });

  it('normaliza paginacion y campos históricos ausentes', async () => {
    boletosRepository.findAndCount.mockResolvedValue([
      [
        {
          id: 'boleto-1',
          codigoQr: 'BOL-001',
          estado: EstadoBoleto.USADO,
          fechaEmision: new Date(),
          reserva: {
            id: 'reserva-1',
            usuarioIdExterno: 'user-1',
            fechaReserva: new Date(),
            total: 100,
            detalles: undefined,
          },
        },
      ],
      1,
    ]);

    const result = await service.findByUser('user-1', 0, 100);

    expect(boletosRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 50,
      }),
    );
    expect(result.data[0]).toEqual(
      expect.objectContaining({
        fechaUso: null,
        funcion: {
          id: null,
          fecha: null,
          hora: null,
          sala: null,
        },
        pelicula: {
          id: null,
          titulo: null,
        },
        asientos: [],
      }),
    );
    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(50);
  });
});
