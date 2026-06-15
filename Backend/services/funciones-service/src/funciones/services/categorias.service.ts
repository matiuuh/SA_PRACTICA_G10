import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateCategoriaDto } from '../dto/create-categoria.dto';
import { Categoria } from '../entities/categoria.entity';

@Injectable()
export class CategoriasService {
  constructor(
    @InjectRepository(Categoria)
    private readonly repo: Repository<Categoria>,
  ) {}

  findAll(): Promise<Categoria[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Categoria> {
    const categoria = await this.repo.findOne({ where: { id } });

    if (!categoria) {
      throw new NotFoundException(`Categoria ${id} no encontrada`);
    }

    return categoria;
  }

  async findByNombre(nombre: string): Promise<Categoria> {
    const normalizedName = nombre.trim();
    const categoria = await this.repo.findOne({ where: { nombre: ILike(normalizedName) } });

    if (!categoria) {
      throw new NotFoundException(`Categoria "${normalizedName}" no encontrada. Verifica que el nombre coincida con una categoria existente.`);
    }

    return categoria;
  }

  async create(dto: CreateCategoriaDto): Promise<Categoria> {
    const nombre = dto.nombre.trim();
    const existe = await this.repo.findOne({ where: { nombre } });

    if (existe) {
      throw new ConflictException(`Ya existe una categoria "${nombre}"`);
    }

    return this.repo.save(this.repo.create({ nombre }));
  }
}
