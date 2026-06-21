import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { SearchAdminTicketsDto } from '../dto/search-admin-tickets.dto';
import { Boleto } from '../entities/boleto.entity';
import { PaginatedTicketHistory } from '../interfaces/ticket-history.interface';
import { mapTicketHistoryItem } from '../mappers/ticket-history.mapper';

@Injectable()
export class AdminTicketSearchService {
  constructor(
    @InjectRepository(Boleto)
    private readonly boletosRepository: Repository<Boleto>,
  ) {}

  async search(
    filters: SearchAdminTicketsDto,
  ): Promise<PaginatedTicketHistory> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(50, Math.max(1, filters.limit ?? 10));

    if (
      filters.fechaDesde &&
      filters.fechaHasta &&
      filters.fechaDesde > filters.fechaHasta
    ) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final',
      );
    }

    const query = this.boletosRepository
      .createQueryBuilder('boleto')
      .leftJoinAndSelect('boleto.reserva', 'reserva')
      .leftJoinAndSelect('reserva.detalles', 'detalle')
      .leftJoinAndSelect('detalle.asiento', 'asiento')
      .orderBy('boleto.fecha_emision', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const identificador = filters.identificador?.trim();
    if (identificador) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(boleto.codigo_qr) LIKE :identificador', {
            identificador: `%${identificador.toLowerCase()}%`,
          });

          if (this.isUuid(identificador)) {
            qb.orWhere('boleto.id_boleto = :boletoId', {
              boletoId: identificador,
            });
          }
        }),
      );
    }

    if (filters.pelicula?.trim()) {
      query.andWhere('LOWER(boleto.titulo_pelicula) LIKE :pelicula', {
        pelicula: `%${filters.pelicula.trim().toLowerCase()}%`,
      });
    }

    if (filters.estado) {
      query.andWhere('boleto.estado = :estado', {
        estado: filters.estado,
      });
    }

    if (filters.fechaDesde) {
      query.andWhere('boleto.fecha_emision >= :fechaDesde', {
        fechaDesde: `${filters.fechaDesde}T00:00:00.000Z`,
      });
    }

    if (filters.fechaHasta) {
      query.andWhere('boleto.fecha_emision < :fechaHasta', {
        fechaHasta: this.nextDay(filters.fechaHasta),
      });
    }

    const [boletos, total] = await query.getManyAndCount();

    return {
      data: boletos.map(mapTicketHistoryItem),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private isUuid(value: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    );
  }

  private nextDay(date: string): string {
    const next = new Date(`${date}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString();
  }
}
