import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pelicula } from '../entities/pelicula.entity';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
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

  findByTipoCartelera(idTipo: number): Promise<Pelicula[]> {
    return this.repo.find({ where: { tipoCartelera: { id: idTipo }, activa: true } });
  }

  async findOne(id: number): Promise<Pelicula> {
    const pelicula = await this.repo.findOne({ where: { id } });
    if (!pelicula) throw new NotFoundException(`Pelicula #${id} no encontrada`);
    return pelicula;
  }

  async create(dto: CreatePeliculaDto): Promise<Pelicula> {
    const existe = await this.repo.findOne({ where: { titulo: dto.titulo } });
    if (existe) throw new ConflictException(`Ya existe una película con el título "${dto.titulo}"`);

    const categoria = await this.categoriasService.findOne(dto.id_categoria);
    const tipoCartelera = await this.tipoCarteleraService.findOne(dto.id_tipo_cartelera);

    return this.repo.save(this.repo.create({ ...dto, categoria, tipoCartelera }));
  }

  async update(id: number, dto: UpdatePeliculaDto): Promise<Pelicula> {
    const pelicula = await this.findOne(id);

    if (dto.id_categoria) {
      pelicula.categoria = await this.categoriasService.findOne(dto.id_categoria);
    }
    if (dto.id_tipo_cartelera) {
      pelicula.tipoCartelera = await this.tipoCarteleraService.findOne(dto.id_tipo_cartelera);
    }

    Object.assign(pelicula, {
      titulo: dto.titulo ?? pelicula.titulo,
      sinopsis: dto.sinopsis ?? pelicula.sinopsis,
      duracion_minutos: dto.duracion_minutos ?? pelicula.duracion_minutos,
      poster_url: dto.poster_url ?? pelicula.poster_url,
      activa: dto.activa ?? pelicula.activa,
    });

    return this.repo.save(pelicula);
  }

  async remove(id: number): Promise<void> {
    const pelicula = await this.findOne(id);
    const tieneFunciones = await this.repo
      .createQueryBuilder('p')
      .innerJoin('p.funciones', 'f')
      .where('p.id = :id AND f.activa = true', { id })
      .getCount();

    if (tieneFunciones > 0) {
      throw new BadRequestException('No se puede eliminar una película con funciones activas');
    }

    await this.repo.remove(pelicula);
  }
}
