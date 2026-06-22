import { ConfigService } from '@nestjs/config';
import { HttpFuncionCatalogClient } from './http-funcion-catalog.client';

describe('HttpFuncionCatalogClient', () => {
  let client: HttpFuncionCatalogClient;

  beforeEach(() => {
    client = new HttpFuncionCatalogClient({
      get: jest.fn().mockReturnValue('http://funciones:3003'),
    } as unknown as ConfigService);
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mapea la respuesta de funciones-service', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        id: 'funcion-1',
        fecha: '2026-06-22',
        hora: '18:30:00',
        pelicula: {
          id: 'pelicula-1',
          titulo: 'Pelicula',
        },
        sala: {
          nombre: 'Sala 1',
        },
      }),
    });

    await expect(client.findSnapshotById('funcion-1')).resolves.toEqual({
      funcionId: 'funcion-1',
      peliculaId: 'pelicula-1',
      peliculaTitulo: 'Pelicula',
      fechaFuncion: '2026-06-22',
      horaFuncion: '18:30:00',
      salaNombre: 'Sala 1',
    });
  });

  it('retorna null cuando funciones-service responde error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 503,
    });

    await expect(client.findSnapshotById('funcion-1')).resolves.toBeNull();
  });

  it('retorna null cuando ocurre un error de red', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('sin conexion'));

    await expect(client.findSnapshotById('funcion-1')).resolves.toBeNull();
  });

  it('tolera errores no representados por Error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue('fallo');

    await expect(client.findSnapshotById('funcion-1')).resolves.toBeNull();
  });
});
