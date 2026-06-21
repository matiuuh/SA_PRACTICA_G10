import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginateTicketHistoryDto } from '../dto/paginate-ticket-history.dto';
import { Boleto } from '../entities/boleto.entity';
import { EstadoBoleto } from '../enums/estado-boleto.enum';
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
    filters: PaginateTicketHistoryDto,
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
      .innerJoinAndSelect('boleto.reserva', 'reserva')
      .leftJoinAndSelect('reserva.detalles', 'detalle')
      .leftJoinAndSelect('detalle.asiento', 'asiento');
    this.applyFilters(query, usuarioId, filters);

    const statusQuery = this.boletosRepository
      .createQueryBuilder('boleto')
      .innerJoin('boleto.reserva', 'reserva');
    this.applyFilters(statusQuery, usuarioId, filters);

    const statusRows = await statusQuery
      .select('boleto.estado', 'estado')
      .addSelect('COUNT(DISTINCT boleto.id_boleto)', 'total')
      .groupBy('boleto.estado')
      .getRawMany<{ estado: EstadoBoleto; total: string }>();

    const [boletos, total] = await query
      .orderBy('boleto.fechaEmision', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const totalsByStatus = statusRows.reduce(
      (totals, row) => {
        const value = Number(row.total);
        if (row.estado === EstadoBoleto.VALIDO) totals.validos = value;
        if (row.estado === EstadoBoleto.USADO) totals.usados = value;
        return totals;
      },
      { validos: 0, usados: 0 },
    );

    return {
      data: boletos.map(mapTicketHistoryItem),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        totalsByStatus,
      },
    };
  }

  private applyFilters(
    query: SelectQueryBuilder<Boleto>,
    usuarioId: string,
    filters: PaginateTicketHistoryDto,
  ): void {
    query.andWhere('reserva.usuario_id_externo = :usuarioId', { usuarioId });

    const identificador = filters.identificador?.trim().toLowerCase();
    if (identificador) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('LOWER(boleto.codigo_qr) LIKE :identificador', {
            identificador: `%${identificador}%`,
          }).orWhere('LOWER(boleto.titulo_pelicula) LIKE :identificador', {
            identificador: `%${identificador}%`,
          });
        }),
      );
    }

    if (filters.estado) {
      query.andWhere('boleto.estado = :estado', { estado: filters.estado });
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
  }

  private nextDay(date: string): string {
    const next = new Date(`${date}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return next.toISOString();
  }
}
