import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Boleto } from '../entities/boleto.entity';
import { PaginatedTicketHistory } from '../interfaces/ticket-history.interface';
import { mapTicketHistoryItem } from '../mappers/ticket-history.mapper';

@Injectable()
export class TicketHistoryService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
  ) {}

  async findByUser(
    usuarioId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedTicketHistory> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(50, Math.max(1, limit));
    const [boletos, total] = await this.boletosRepository.findAndCount({
      where: {
        reserva: {
          usuarioIdExterno: usuarioId,
        },
      },
      relations: [
        'reserva',
        'reserva.detalles',
        'reserva.detalles.asiento',
      ],
      order: {
        fechaEmision: 'DESC',
      },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });

    return {
      data: boletos.map(mapTicketHistoryItem),
      meta: {
        page: safePage,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }
}
