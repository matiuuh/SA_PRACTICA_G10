import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTipoCarteleraDto } from '../dto/create-tipo-cartelera.dto';
import { TipoCartelera } from '../entities/tipo-cartelera.entity';

@Injectable()
export class TipoCarteleraService {
  constructor(
    @InjectRepository(TipoCartelera)
    private readonly repo: Repository<TipoCartelera>,
  ) {}

  findAll(): Promise<TipoCartelera[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<TipoCartelera> {
    const tipo = await this.repo.findOne({ where: { id } });

    if (!tipo) {
      throw new NotFoundException(`Tipo de cartelera ${id} no encontrado`);
    }

    return tipo;
  }

  async create(dto: CreateTipoCarteleraDto): Promise<TipoCartelera> {
    const nombre = dto.nombre.trim();
    const existe = await this.repo.findOne({ where: { nombre } });

    if (existe) {
      throw new ConflictException(`Ya existe un tipo de cartelera "${nombre}"`);
    }

    return this.repo.save(this.repo.create({ nombre }));
  }
}
