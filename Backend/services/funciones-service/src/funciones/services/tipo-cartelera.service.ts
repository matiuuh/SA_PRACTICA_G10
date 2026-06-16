import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
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

  async findByNombre(nombre: string): Promise<TipoCartelera> {
    const normalizedName = nombre.trim();
    const tipo = await this.repo.findOne({ where: { nombre: ILike(normalizedName) } });

    if (!tipo) {
      throw new NotFoundException(`Tipo de cartelera "${normalizedName}" no encontrado. Verifica que el nombre coincida con un tipo existente.`);
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
