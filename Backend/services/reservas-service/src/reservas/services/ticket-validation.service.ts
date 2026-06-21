import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Asiento } from '../entities/asiento.entity';
import { Boleto } from '../entities/boleto.entity';
import { Reserva } from '../entities/reserva.entity';
import { EstadoAsiento } from '../enums/estado-asiento.enum';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
import { TicketHistoryItem } from '../interfaces/ticket-history.interface';
import { mapTicketHistoryItem } from '../mappers/ticket-history.mapper';
import { ReservasGateway } from '../reservas.gateway';

type TicketSelector =
  | { type: 'codigo'; value: string }
  | { type: 'id'; value: string };

interface ValidationResult {
  ticket: TicketHistoryItem;
  funcionId: string | null;
}

@Injectable()
export class TicketValidationService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly reservasGateway: ReservasGateway,
  ) {}

  validateByCode(codigo: string, administradorId: string) {
    return this.validate(
      { type: 'codigo', value: codigo.trim() },
      administradorId,
    );
  }

  validateManually(ticketId: string, administradorId: string) {
    return this.validate({ type: 'id', value: ticketId }, administradorId);
  }

  private async validate(
    selector: TicketSelector,
    administradorId: string,
  ): Promise<TicketHistoryItem> {
    const result = await this.dataSource.transaction((manager) =>
      this.validateWithinTransaction(manager, selector, administradorId),
    );

    if (result.funcionId) {
      this.reservasGateway.notifySeatAvailabilityChanged(result.funcionId);
    }

    return result.ticket;
  }

  private async validateWithinTransaction(
    manager: EntityManager,
    selector: TicketSelector,
    administradorId: string,
  ): Promise<ValidationResult> {
    const ticketRepository = manager.getRepository(Boleto);
    const query = ticketRepository
      .createQueryBuilder('boleto')
      .innerJoinAndSelect('boleto.reserva', 'reserva')
      .setLock('pessimistic_write');

    if (selector.type === 'codigo') {
      query.where('UPPER(boleto.codigo_qr) = UPPER(:codigo)', {
        codigo: selector.value,
      });
    } else {
      query.where('boleto.id_boleto = :ticketId', {
        ticketId: selector.value,
      });
    }

    const boleto = await query.getOne();

    if (!boleto) {
      throw new NotFoundException('Boleto no encontrado');
    }

    if (boleto.estado === EstadoBoleto.USADO) {
      throw new ConflictException('El boleto ya fue utilizado');
    }

    const reserva = await manager.getRepository(Reserva).findOne({
      where: { id: boleto.reserva.id },
      relations: ['detalles', 'detalles.asiento'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva asociada al boleto no encontrada');
    }

    const asientos = reserva.detalles.map((detalle) => {
      detalle.asiento.estado = EstadoAsiento.EN_USO;
      return detalle.asiento;
    });

    if (asientos.length > 0) {
      await manager.getRepository(Asiento).save(asientos);
    }

    boleto.estado = EstadoBoleto.USADO;
    boleto.fechaUso = new Date();
    boleto.validadoPor = administradorId;
    boleto.reserva = reserva;
    await ticketRepository.save(boleto);

    return {
      ticket: mapTicketHistoryItem(boleto),
      funcionId:
        boleto.idFuncionExterna ??
        reserva.detalles[0]?.asiento.idFuncionExterna ??
        null,
    };
  }
}
