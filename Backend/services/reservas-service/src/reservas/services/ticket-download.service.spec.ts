import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { TicketDownloadService } from './ticket-download.service';

describe('TicketDownloadService', () => {
  let service: TicketDownloadService;
  let repository: Record<string, jest.Mock>;
  let generator: Record<string, jest.Mock>;

  const boleto = {
    id: 'boleto-1',
    codigoQr: 'BOL-001',
    estado: EstadoBoleto.VALIDO,
    fechaEmision: new Date('2026-06-20T12:00:00Z'),
    reserva: {
      id: 'reserva-1',
      usuarioIdExterno: 'user-1',
      fechaReserva: new Date('2026-06-20T11:55:00Z'),
      total: 100,
      detalles: [],
    },
  };

  beforeEach(() => {
    repository = {
      findOne: jest.fn().mockResolvedValue(boleto),
    };
    generator = {
      generate: jest.fn().mockResolvedValue({
        filename: 'boleto-BOL-001.pdf',
        contentType: 'application/pdf',
        content: Buffer.from('pdf'),
      }),
    };
    service = new TicketDownloadService(
      repository as any,
      generator as any,
    );
  });

  it('permite descargar al propietario', async () => {
    await expect(
      service.download('boleto-1', 'user-1', 'CLIENTE'),
    ).resolves.toEqual(expect.objectContaining({ contentType: 'application/pdf' }));
    expect(generator.generate).toHaveBeenCalledTimes(1);
  });

  it('permite descargar al administrador', async () => {
    await expect(
      service.download('boleto-1', 'admin-1', 'ADMINISTRADOR'),
    ).resolves.toBeDefined();
  });

  it('rechaza a otro usuario', async () => {
    await expect(
      service.download('boleto-1', 'otro-user', 'CLIENTE'),
    ).rejects.toThrow(ForbiddenException);
    expect(generator.generate).not.toHaveBeenCalled();
  });

  it('rechaza un boleto inexistente', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(
      service.download('no-existe', 'user-1', 'CLIENTE'),
    ).rejects.toThrow(NotFoundException);
  });
});
