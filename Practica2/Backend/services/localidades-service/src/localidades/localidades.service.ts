import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { CreateSalaDto } from './dto/create-sala.dto';
import { Cine } from './entities/cine.entity';
import { Ciudad } from './entities/ciudad.entity';
import { Sala } from './entities/sala.entity';

@Injectable()
export class LocalidadesService {
  constructor(
    @InjectRepository(Ciudad)
    private readonly ciudadesRepository: Repository<Ciudad>,
    @InjectRepository(Cine)
    private readonly cinesRepository: Repository<Cine>,
    @InjectRepository(Sala)
    private readonly salasRepository: Repository<Sala>,
  ) {}

  findCiudades(): Promise<Ciudad[]> {
    return this.ciudadesRepository.find({
      order: { nombre: 'ASC' },
    });
  }

  async findCinesByCiudad(idCiudad: string): Promise<Cine[]> {
    await this.ensureCiudadExists(idCiudad);

    return this.cinesRepository.find({
      where: { ciudad: { id: idCiudad } },
      relations: ['ciudad'],
      order: { nombre: 'ASC' },
    });
  }

  async findSalasByCine(idCine: string): Promise<Sala[]> {
    await this.ensureCineExists(idCine);

    return this.salasRepository.find({
      where: { cine: { id: idCine } },
      relations: ['cine', 'cine.ciudad'],
      order: { nombre: 'ASC' },
    });
  }

  async createCiudad(createCiudadDto: CreateCiudadDto): Promise<Ciudad> {
    const ciudad = this.ciudadesRepository.create({
      id: randomUUID(),
      nombre: createCiudadDto.nombre.trim(),
    });

    return this.ciudadesRepository.save(ciudad);
  }

  async createCine(createCineDto: CreateCineDto): Promise<Cine> {
    const ciudad = await this.ensureCiudadExists(createCineDto.idCiudad);

    const cine = this.cinesRepository.create({
      id: randomUUID(),
      nombre: createCineDto.nombre.trim(),
      direccion: createCineDto.direccion.trim(),
      ciudad,
    });

    return this.cinesRepository.save(cine);
  }

  async createSala(createSalaDto: CreateSalaDto): Promise<Sala> {
    const cine = await this.ensureCineExists(createSalaDto.idCine);

    const sala = this.salasRepository.create({
      id: randomUUID(),
      nombre: createSalaDto.nombre.trim(),
      capacidad: createSalaDto.capacidad,
      tipoSala: createSalaDto.tipoSala?.trim() || null,
      cine,
    });

    return this.salasRepository.save(sala);
  }

  private async ensureCiudadExists(idCiudad: string): Promise<Ciudad> {
    const ciudad = await this.ciudadesRepository.findOne({
      where: { id: idCiudad },
    });

    if (!ciudad) {
      throw new NotFoundException('Ciudad no encontrada');
    }

    return ciudad;
  }

  private async ensureCineExists(idCine: string): Promise<Cine> {
    const cine = await this.cinesRepository.findOne({
      where: { id: idCine },
      relations: ['ciudad'],
    });

    if (!cine) {
      throw new NotFoundException('Cine no encontrado');
    }

    return cine;
  }
}
