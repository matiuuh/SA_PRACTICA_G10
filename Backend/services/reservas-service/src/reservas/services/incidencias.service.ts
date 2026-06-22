import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateIncidenciaDto } from '../dto/create-incidencia.dto';
import { PaginateIncidenciasDto } from '../dto/paginate-incidencias.dto';
import { Incidencia } from '../entities/incidencia.entity';
import { EstadoIncidencia } from '../enums/estado-incidencia.enum';

@Injectable()
export class IncidenciasService {
  constructor(
    @InjectRepository(Incidencia)
    private readonly incidenciasRepository: Repository<Incidencia>,
  ) {}

  async create(
    usuarioId: string,
    dto: CreateIncidenciaDto,
  ): Promise<Incidencia> {
    const incidencia = this.incidenciasRepository.create({
      id: randomUUID(),
      usuarioIdExterno: usuarioId,
      tipo: dto.tipo,
      asunto: dto.asunto.trim(),
      descripcion: dto.descripcion.trim(),
      estado: EstadoIncidencia.PENDIENTE,
      respuesta: null,
      administradorIdExterno: null,
      fechaRespuesta: null,
    });

    return this.incidenciasRepository.save(incidencia);
  }

  findByUser(usuarioId: string, query: PaginateIncidenciasDto) {
    return this.findPaginated(query, { usuarioIdExterno: usuarioId });
  }

  findAll(query: PaginateIncidenciasDto) {
    return this.findPaginated(query);
  }

  async respond(
    id: string,
    respuesta: string,
    administradorId: string,
  ): Promise<Incidencia> {
    const incidencia = await this.incidenciasRepository.findOne({
      where: { id },
    });

    if (!incidencia) {
      throw new NotFoundException('Incidencia no encontrada');
    }

    incidencia.respuesta = respuesta.trim();
    incidencia.estado = EstadoIncidencia.RESPONDIDA;
    incidencia.administradorIdExterno = administradorId;
    incidencia.fechaRespuesta = new Date();

    return this.incidenciasRepository.save(incidencia);
  }

  private async findPaginated(
    query: PaginateIncidenciasDto,
    baseWhere: FindOptionsWhere<Incidencia> = {},
  ) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(50, Math.max(1, query.limit ?? 10));
    const where: FindOptionsWhere<Incidencia> = {
      ...baseWhere,
      ...(query.estado ? { estado: query.estado } : {}),
    };
    const [data, total] = await this.incidenciasRepository.findAndCount({
      where,
      order: { fechaCreacion: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
