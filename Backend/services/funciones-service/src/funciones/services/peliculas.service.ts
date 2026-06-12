import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { Pelicula } from '../entities/pelicula.entity';
import { CategoriasService } from './categorias.service';
import { TipoCarteleraService } from './tipo-cartelera.service';

@Injectable()
export class PeliculasService {
  constructor(
    @InjectRepository(Pelicula)
    private readonly repo: Repository<Pelicula>,
    private readonly categoriasService: CategoriasService,
    private readonly tipoCarteleraService: TipoCarteleraService,
  ) {}

  findAll(): Promise<Pelicula[]> {
    return this.repo.find();
  }

  findByTipoCartelera(idTipo: string): Promise<Pelicula[]> {
    return this.repo.find({ where: { tipoCartelera: { id: idTipo }, activa: true } });
  }

  async findOne(id: string): Promise<Pelicula> {
    const pelicula = await this.repo.findOne({ where: { id } });

    if (!pelicula) {
      throw new NotFoundException(`Pelicula ${id} no encontrada`);
    }

    return pelicula;
  }

  async create(dto: CreatePeliculaDto): Promise<Pelicula> {
    const titulo = dto.titulo.trim();
    const existe = await this.repo.findOne({ where: { titulo } });

    if (existe) {
      throw new ConflictException(`Ya existe una pelicula con el titulo "${titulo}"`);
    }

    const categoria = await this.categoriasService.findOne(dto.id_categoria);
    const tipoCartelera = await this.tipoCarteleraService.findOne(dto.id_tipo_cartelera);
    const peliculaData: DeepPartial<Pelicula> = {
      titulo,
      sinopsis: dto.sinopsis?.trim() || null,
      duracion_minutos: dto.duracion_minutos ?? null,
      poster_url: dto.poster_url?.trim() || null,
      activa: dto.activa ?? true,
      categoria,
      tipoCartelera,
    };

    return this.repo.save(this.repo.create(peliculaData));
  }

  async update(id: string, dto: UpdatePeliculaDto): Promise<Pelicula> {
    const pelicula = await this.findOne(id);

    if (dto.id_categoria) {
      pelicula.categoria = await this.categoriasService.findOne(dto.id_categoria);
    }

    if (dto.id_tipo_cartelera) {
      pelicula.tipoCartelera = await this.tipoCarteleraService.findOne(
        dto.id_tipo_cartelera,
      );
    }

    Object.assign(pelicula, {
      titulo: dto.titulo?.trim() ?? pelicula.titulo,
      sinopsis: dto.sinopsis?.trim() ?? pelicula.sinopsis,
      duracion_minutos: dto.duracion_minutos ?? pelicula.duracion_minutos,
      poster_url: dto.poster_url?.trim() ?? pelicula.poster_url,
      activa: dto.activa ?? pelicula.activa,
    });

    return this.repo.save(pelicula);
  }

  async remove(id: string): Promise<void> {
    const pelicula = await this.findOne(id);
    const tieneFunciones = await this.repo
      .createQueryBuilder('p')
      .innerJoin('p.funciones', 'f')
      .where('p.id = :id AND f.activa = true', { id })
      .getCount();

    if (tieneFunciones > 0) {
      throw new BadRequestException('No se puede eliminar una pelicula con funciones activas');
    }

    await this.repo.remove(pelicula);
  }
}
