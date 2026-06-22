import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boleto } from '../entities/boleto.entity';
import {
  TICKET_DOCUMENT_GENERATOR,
  TicketDocument,
  TicketDocumentGenerator,
} from '../interfaces/ticket-document-generator.interface';
import { mapTicketHistoryItem } from '../mappers/ticket-history.mapper';

@Injectable()
export class TicketDownloadService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
    @Inject(TICKET_DOCUMENT_GENERATOR)
    private readonly documentGenerator: TicketDocumentGenerator,
  ) {}

  async download(
    ticketId: string,
    usuarioId: string,
    rol?: string,
  ): Promise<TicketDocument> {
    const boleto = await this.boletosRepository.findOne({
      where: { id: ticketId },
      relations: [
        'reserva',
        'reserva.detalles',
        'reserva.detalles.asiento',
      ],
    });

    if (!boleto) {
      throw new NotFoundException('Boleto no encontrado');
    }

    if (
      rol !== 'ADMINISTRADOR' &&
      boleto.reserva.usuarioIdExterno !== usuarioId
    ) {
      throw new ForbiddenException('No puedes descargar este boleto');
    }

    return this.documentGenerator.generate(mapTicketHistoryItem(boleto));
  }
}
