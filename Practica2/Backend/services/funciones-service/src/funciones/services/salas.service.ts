import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sala } from '../entities/sala.entity';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';

@Injectable()
export class SalasService {
  constructor(
    @InjectRepository(Sala)
    private readonly repo: Repository<Sala>,
  ) {}

  findAll(): Promise<Sala[]> {
    return this.repo.find();
  }

  findByCine(idCineExterno: number): Promise<Sala[]> {
    return this.repo.find({ where: { id_cine_externo: idCineExterno } });
  }

  async findOne(id: number): Promise<Sala> {
    const sala = await this.repo.findOne({ where: { id } });
    if (!sala) throw new NotFoundException(`Sala #${id} no encontrada`);
    return sala;
  }

  async create(dto: CreateSalaDto): Promise<Sala> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: number, dto: UpdateSalaDto): Promise<Sala> {
    const sala = await this.findOne(id);
    Object.assign(sala, dto);
    return this.repo.save(sala);
  }

  async remove(id: number): Promise<void> {
    const sala = await this.findOne(id);
    await this.repo.remove(sala);
  }
}
