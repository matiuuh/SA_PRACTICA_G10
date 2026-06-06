import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TipoCartelera } from '../entities/tipo-cartelera.entity';
import { CreateTipoCarteleraDto } from '../dto/create-tipo-cartelera.dto';

@Injectable()
export class TipoCarteleraService {
  constructor(
    @InjectRepository(TipoCartelera)
    private readonly repo: Repository<TipoCartelera>,
  ) {}

  findAll(): Promise<TipoCartelera[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<TipoCartelera> {
    const tipo = await this.repo.findOne({ where: { id } });
    if (!tipo) throw new NotFoundException(`TipoCartelera #${id} no encontrado`);
    return tipo;
  }

  async create(dto: CreateTipoCarteleraDto): Promise<TipoCartelera> {
    const existe = await this.repo.findOne({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`Ya existe un tipo de cartelera "${dto.nombre}"`);
    return this.repo.save(this.repo.create(dto));
  }
}
