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
import { UpdateFuncionDto } from '../dto/update-funcion.dto';
import { Funcion } from '../entities/funcion.entity';
import { PeliculasService } from './peliculas.service';
import { SalasService } from './salas.service';

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
      `${reservasServiceUrl}/reservas/internal/funciones/${id}/boletos`,
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
