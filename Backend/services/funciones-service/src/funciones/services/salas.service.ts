import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';
import { Sala } from '../entities/sala.entity';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private readonly repo: Repository<Sala>,
  ) {}

  findAll(): Promise<Sala[]> {
    return this.repo.find();
  }

  findByCine(idCineExterno: string): Promise<Sala[]> {
    return this.repo.find({ where: { id_cine_externo: idCineExterno } });
  }

  async findOne(id: string): Promise<Sala> {
    const sala = await this.repo.findOne({ where: { id } });

    if (!sala) {
      throw new NotFoundException(`Sala ${id} no encontrada`);
    }

    return sala;
  }

  async create(dto: CreateSalaDto): Promise<Sala> {
    const salaData: DeepPartial<Sala> = {
      nombre: dto.nombre.trim(),
      capacidad: dto.capacidad,
      tipo: dto.tipo?.trim() || '2D',
      id_cine_externo: dto.id_cine_externo,
    };

    return this.repo.save(this.repo.create(salaData));
  }

  async update(id: string, dto: UpdateSalaDto): Promise<Sala> {
    const sala = await this.findOne(id);

    Object.assign(sala, {
      nombre: dto.nombre?.trim() ?? sala.nombre,
      capacidad: dto.capacidad ?? sala.capacidad,
      tipo: dto.tipo?.trim() ?? sala.tipo,
      id_cine_externo: dto.id_cine_externo ?? sala.id_cine_externo,
    });

    return this.repo.save(sala);
  }

  async remove(id: string): Promise<void> {
    const sala = await this.findOne(id);
    await this.repo.remove(sala);
  }
}
