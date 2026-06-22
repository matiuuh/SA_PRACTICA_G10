import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { Cine } from './entities/cine.entity';
import { Ciudad } from './entities/ciudad.entity';

export interface PaginatedCines {
  data: Cine[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginateCinesQuery {
  page?: number;
  limit?: number;
  search?: string;
  idCiudad?: string;
}

@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadesRepository: Repository<Ciudad>,
    @InjectRepository(Cine)
    private readonly cinesRepository: Repository<Cine>,
  ) {}

  // ─── Ciudades ─────────────────────────────────────────────────────

  findCiudades(): Promise<Ciudad[]> {
    return this.ciudadesRepository.find({ order: { nombre: 'ASC' } });
  }

  findCiudadById(id: string): Promise<Ciudad> {
    return this.ensureCiudadExists(id);
  }

  async createCiudad(dto: CreateCiudadDto): Promise<Ciudad> {
    const ciudad = this.ciudadesRepository.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
    });
    return this.ciudadesRepository.save(ciudad);
  }

  async updateCiudad(id: string, dto: UpdateCiudadDto): Promise<Ciudad> {
    const ciudad = await this.ensureCiudadExists(id);
    if (dto.nombre) ciudad.nombre = dto.nombre.trim();
    return this.ciudadesRepository.save(ciudad);
  }

  async removeCiudad(id: string): Promise<void> {
    const ciudad = await this.ensureCiudadExists(id);
    await this.ciudadesRepository.remove(ciudad);
  }

  // ─── Cines ────────────────────────────────────────────────────────

  findCines(): Promise<Cine[]> {
    return this.cinesRepository.find({
      relations: ['ciudad'],
      order: { nombre: 'ASC' },
    });
  }

  async findCinesPaginated(query: PaginateCinesQuery): Promise<PaginatedCines> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 50);

    const qb = this.cinesRepository
      .createQueryBuilder('cine')
      .leftJoinAndSelect('cine.ciudad', 'ciudad')
      .orderBy('cine.nombre', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(cine.nombre) LIKE :search OR LOWER(cine.direccion) LIKE :search OR LOWER(ciudad.nombre) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    if (query.idCiudad) {
      qb.andWhere('ciudad.id = :idCiudad', { idCiudad: query.idCiudad });
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

  findCineById(id: string): Promise<Cine> {
    return this.ensureCineExists(id);
  }

  findCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    return this.ensureCiudadExists(idCiudad).then(() =>
      this.cinesRepository.find({
        where: { ciudad: { id: idCiudad } },
        relations: ['ciudad'],
        order: { nombre: 'ASC' },
      }),
    );
  }

  async createCine(dto: CreateCineDto): Promise<Cine> {
    const ciudad = await this.ensureCiudadExists(dto.idCiudad);
    const cine = this.cinesRepository.create({
      id: randomUUID(),
      nombre: dto.nombre.trim(),
      direccion: dto.direccion.trim(),
      ciudad,
    });
    return this.cinesRepository.save(cine);
  }

  async updateCine(id: string, dto: UpdateCineDto): Promise<Cine> {
    const cine = await this.ensureCineExists(id);
    if (dto.nombre) cine.nombre = dto.nombre.trim();
    if (dto.direccion) cine.direccion = dto.direccion.trim();
    if (dto.idCiudad) cine.ciudad = await this.ensureCiudadExists(dto.idCiudad);
    return this.cinesRepository.save(cine);
  }

  async removeCine(id: string): Promise<void> {
    const cine = await this.ensureCineExists(id);
    await this.cinesRepository.remove(cine);
  }

  // ─── Salas ────────────────────────────────────────────────────────

  // ─── Helpers ──────────────────────────────────────────────────────

  private async ensureCiudadExists(id: string): Promise<Ciudad> {
    const ciudad = await this.ciudadesRepository.findOne({ where: { id } });
    if (!ciudad) throw new NotFoundException('Ciudad no encontrada');
    return ciudad;
  }

  private async ensureCineExists(id: string): Promise<Cine> {
    const cine = await this.cinesRepository.findOne({
      where: { id },
      relations: ['ciudad'],
    });
    if (!cine) throw new NotFoundException('Cine no encontrado');
    return cine;
  }

}
