import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Categoria } from '../entities/categoria.entity';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly repo: Repository<Categoria>,
  ) {}

  findAll(): Promise<Categoria[]> {
    return this.repo.find();
  }

  async findOne(id: number): Promise<Categoria> {
    const categoria = await this.repo.findOne({ where: { id } });
    if (!categoria) throw new NotFoundException(`Categoria #${id} no encontrada`);
    return categoria;
  }

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const existe = await this.repo.findOne({ where: { nombre: dto.nombre } });
    if (existe) throw new ConflictException(`Ya existe una categoría "${dto.nombre}"`);
    return this.repo.save(this.repo.create(dto));
  }
}
