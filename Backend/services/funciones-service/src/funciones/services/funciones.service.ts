import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateFuncionDto } from '../dto/create-funcion.dto';
import { PaginateFuncionesDto } from '../dto/paginate-funciones.dto';
import { UpdateFuncionDto } from '../dto/update-funcion.dto';
import { Funcion } from '../entities/funcion.entity';
import { PeliculasService } from './peliculas.service';
import { SalasService } from './salas.service';

export interface PaginatedFunciones {
  data: Funcion[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Injectable()
export class FuncionesService {
  constructor(
    @InjectRepository(Funcion)
    private readonly repo: Repository<Funcion>,
    private readonly peliculasService: PeliculasService,
    private readonly salasService: SalasService,
    private readonly configService: ConfigService,
  ) {}

  findAll(): Promise<Funcion[]> {
    return this.repo.find();
  }

  findBySala(idSala: string): Promise<Funcion[]> {
    return this.repo.find({ where: { sala: { id: idSala }, activa: true } });
  }

  findByPelicula(idPelicula: string): Promise<Funcion[]> {
    return this.repo.find({ where: { pelicula: { id: idPelicula }, activa: true } });
  }

  findByCine(idCineExterno: string): Promise<Funcion[]> {
    return this.repo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.sala', 's')
      .innerJoinAndSelect('f.pelicula', 'p')
      .innerJoinAndSelect('p.categoria', 'c')
      .innerJoinAndSelect('p.tipoCartelera', 'tc')
      .where('s.id_cine_externo = :id AND f.activa = true', { id: idCineExterno })
      .getMany();
  }

  async findPaginated(query: PaginateFuncionesDto): Promise<PaginatedFunciones> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const qb = this.repo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.sala', 's')
      .innerJoinAndSelect('f.pelicula', 'p')
      .innerJoinAndSelect('p.categoria', 'c')
      .innerJoinAndSelect('p.tipoCartelera', 'tc')
      .orderBy('f.fecha', 'ASC')
      .addOrderBy('f.hora', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.cine) {
      qb.andWhere('s.id_cine_externo = :cine AND f.activa = true', { cine: query.cine });
    }

    if (query.sala) {
      qb.andWhere('s.id = :sala', { sala: query.sala });
    }

    if (query.pelicula) {
      qb.andWhere('p.id = :pelicula', { pelicula: query.pelicula });
    }

    const [data, total] = await qb.getManyAndCount();

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

  async findCarteleraPaginated(
    idCine: string,
    page: number,
    limit: number,
    tipoCartelera?: string,
  ): Promise<{ data: Funcion[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    const safeLimit = Math.min(limit, 50);
    const tipoNorm = tipoCartelera?.trim().toLowerCase() || undefined;

    // Get distinct pelicula IDs that have active funciones in this cine, paginated
    const peliculasQb = this.repo
      .createQueryBuilder('f')
      .innerJoin('f.sala', 's')
      .innerJoin('f.pelicula', 'p')
      .innerJoin('p.tipoCartelera', 'tc')
      .select('p.id', 'peliculaId')
      .addSelect('p.titulo', 'titulo')
      .distinct(true)
      .where('s.id_cine_externo = :cine AND f.activa = true', { cine: idCine })
      .orderBy('p.titulo', 'ASC')
      .offset((page - 1) * safeLimit)
      .limit(safeLimit);

    const totalQb = this.repo
      .createQueryBuilder('f')
      .innerJoin('f.sala', 's')
      .innerJoin('f.pelicula', 'p')
      .innerJoin('p.tipoCartelera', 'tc')
      .select('COUNT(DISTINCT p.id)', 'total')
      .where('s.id_cine_externo = :cine AND f.activa = true', { cine: idCine });

    if (tipoNorm) {
      peliculasQb.andWhere('LOWER(tc.nombre) = :tipoNorm', { tipoNorm });
      totalQb.andWhere('LOWER(tc.nombre) = :tipoNorm', { tipoNorm });
    }

    const [peliculaRows, totalRow] = await Promise.all([
      peliculasQb.getRawMany<{ peliculaId: string }>(),
      totalQb.getRawOne<{ total: string }>(),
    ]);

    const total = parseInt(totalRow?.total ?? '0', 10);
    const peliculaIds = peliculaRows.map((row) => row.peliculaId);

    if (peliculaIds.length === 0) {
      return { data: [], meta: { page, limit: safeLimit, total: 0, totalPages: 0 } };
    }

    const funciones = await this.repo
      .createQueryBuilder('f')
      .innerJoinAndSelect('f.sala', 's')
      .innerJoinAndSelect('f.pelicula', 'p')
      .innerJoinAndSelect('p.categoria', 'c')
      .innerJoinAndSelect('p.tipoCartelera', 'tc')
      .where('s.id_cine_externo = :cine AND f.activa = true AND p.id IN (:...ids)', {
        cine: idCine,
        ids: peliculaIds,
      })
      .orderBy('p.titulo', 'ASC')
      .addOrderBy('f.fecha', 'ASC')
      .addOrderBy('f.hora', 'ASC')
      .getMany();

    return {
      data: funciones,
      meta: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: string): Promise<Funcion> {
    const funcion = await this.repo.findOne({ where: { id } });

    if (!funcion) {
      throw new NotFoundException(`Funcion ${id} no encontrada`);
    }

    return funcion;
  }

  async create(dto: CreateFuncionDto): Promise<Funcion> {
    const pelicula = await this.peliculasService.findOne(dto.id_pelicula);
    const sala = await this.salasService.findOne(dto.id_sala);

    const conflicto = await this.repo.findOne({
      where: { sala: { id: dto.id_sala }, fecha: dto.fecha, hora: dto.hora, activa: true },
    });

    if (conflicto) {
      throw new ConflictException('Ya existe una funcion en esa sala, fecha y hora');
    }
    const funcionData: DeepPartial<Funcion> = {
      fecha: dto.fecha,
      hora: dto.hora,
      precio: dto.precio,
      activa: dto.activa ?? true,
      pelicula,
      sala,
    };

    return this.repo.save(this.repo.create(funcionData));
  }

  async remove(id: string): Promise<void> {
    const funcion = await this.findOne(id);

    if (await this.hasAssociatedBoletos(id)) {
      throw new ConflictException(
        'No se puede eliminar la funcion porque tiene boletos asociados.',
      );
    }

    await this.repo.remove(funcion);
  }

  private async hasAssociatedBoletos(id: string): Promise<boolean> {
    const reservasServiceUrl =
      this.configService.get<string>('RESERVAS_SERVICE_URL') || 'http://reservas-service:3004';
    const response = await fetch(
      `${reservasServiceUrl}/api/reservas/internal/funciones/${id}/boletos`,
    ).catch(() => null);

    if (!response?.ok) {
      throw new ServiceUnavailableException(
        'No se pudo validar si la funcion tiene boletos asociados.',
      );
    }

    const data = (await response.json()) as { hasBoletos?: boolean };

    return data.hasBoletos === true;
  }

  async update(id: string, dto: UpdateFuncionDto): Promise<Funcion> {
    const funcion = await this.findOne(id);

    if (dto.id_pelicula) {
      funcion.pelicula = await this.peliculasService.findOne(dto.id_pelicula);
    }

    if (dto.id_sala) {
      funcion.sala = await this.salasService.findOne(dto.id_sala);
    }

    const fechaFinal = dto.fecha ?? funcion.fecha;
    const horaFinal = dto.hora ?? funcion.hora;
    const salaId = dto.id_sala ?? funcion.sala.id;

    if (dto.fecha || dto.hora || dto.id_sala) {
      const conflicto = await this.repo
        .createQueryBuilder('f')
        .where(
          'f.id_sala = :salaId AND f.fecha = :fecha AND f.hora = :hora AND f.activa = true AND f.id_funcion != :id',
          { salaId, fecha: fechaFinal, hora: horaFinal, id },
        )
        .getOne();

      if (conflicto) {
        throw new ConflictException('Conflicto de horario en esa sala, fecha y hora');
      }
    }

    Object.assign(funcion, {
      fecha: dto.fecha ?? funcion.fecha,
      hora: dto.hora ?? funcion.hora,
      precio: dto.precio ?? funcion.precio,
      activa: dto.activa ?? funcion.activa,
    });

    return this.repo.save(funcion);
  }
}
