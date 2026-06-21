import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { PdfTicketDocumentGenerator } from './pdf-ticket-document.generator';

describe('PdfTicketDocumentGenerator', () => {
  it('genera un PDF válido con nombre seguro', async () => {
    const generator = new PdfTicketDocumentGenerator();
    const result = await generator.generate({
      id: 'boleto-1',
      codigoQr: 'BOL/001:*',
      estado: EstadoBoleto.VALIDO,
      fechaEmision: new Date('2026-06-20T12:00:00Z'),
      fechaUso: null,
      validadoPor: null,
      reserva: {
        id: 'reserva-1',
        usuarioId: 'user-1',
        fechaReserva: new Date('2026-06-20T11:55:00Z'),
        total: 125.5,
      },
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
      asientos: [
        { id: 'asiento-1', fila: 'A', numero: 1 },
        { id: 'asiento-2', fila: 'A', numero: 2 },
      ],
    });

    expect(result.contentType).toBe('application/pdf');
    expect(result.filename).toBe('boleto-BOL_001__.pdf');
    expect(result.content.subarray(0, 4).toString()).toBe('%PDF');

    expect(result.content.includes(Buffer.from('%%EOF'))).toBe(true);
  });

  it('tolera datos históricos y asientos ausentes', async () => {
    const generator = new PdfTicketDocumentGenerator();
    const result = await generator.generate({
      id: 'boleto-2',
      codigoQr: 'BOL-002',
      estado: EstadoBoleto.USADO,
      fechaEmision: new Date('2026-06-20T12:00:00Z'),
      fechaUso: new Date('2026-06-20T13:00:00Z'),
      validadoPor: 'admin-1',
      reserva: {
        id: 'reserva-2',
        usuarioId: 'user-1',
        fechaReserva: new Date('2026-06-20T11:55:00Z'),
        total: 0,
      },
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
    });

    expect(result.content.length).toBeGreaterThan(1000);
  });
});
