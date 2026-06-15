import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import {
  CsvPeliculaRow,
  PeliculasCsvImportResult,
} from '../dto/import-peliculas-csv.dto';
import { PaginatePeliculasDto } from '../dto/paginate-peliculas.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { Pelicula } from '../entities/pelicula.entity';
import { CategoriasService } from './categorias.service';
import { TipoCarteleraService } from './tipo-cartelera.service';

export interface PaginatedPeliculas {
  data: Pelicula[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

  async findPaginated(query: PaginatePeliculasDto): Promise<PaginatedPeliculas> {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 10, 10);
    const tipoCarteleraId = query.id_tipo_cartelera ?? query.tipo_cartelera;

    const qb = this.repo
      .createQueryBuilder('pelicula')
      .leftJoinAndSelect('pelicula.categoria', 'categoria')
      .leftJoinAndSelect('pelicula.tipoCartelera', 'tipoCartelera')
      .orderBy('pelicula.titulo', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.search?.trim()) {
      qb.andWhere(
        '(LOWER(pelicula.titulo) LIKE :search OR LOWER(pelicula.sinopsis) LIKE :search)',
        { search: `%${query.search.trim().toLowerCase()}%` },
      );
    }

    if (query.id_categoria) {
      qb.andWhere('categoria.id = :idCategoria', {
        idCategoria: query.id_categoria,
      });
    }

    if (tipoCarteleraId) {
      qb.andWhere('tipoCartelera.id = :idTipoCartelera', {
        idTipoCartelera: tipoCarteleraId,
      });
    }

    if (query.activa !== undefined) {
      qb.andWhere('pelicula.activa = :activa', { activa: query.activa });
    }

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
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

  async importCsv(file: any): Promise<PeliculasCsvImportResult> {
    if (!file?.buffer) {
      throw new BadRequestException('Debes enviar un archivo CSV en el campo "file"');
    }

    const rows = this.parseCsv(file.buffer.toString('utf8'));
    if (rows.length === 0) {
      throw new BadRequestException('El archivo CSV no contiene registros');
    }

    const result: PeliculasCsvImportResult = {
      insertadas: 0,
      fallidas: 0,
      errores: [],
    };

    for (const row of rows) {
      try {
        await this.create(await this.mapCsvRowToDto(row.data));
        result.insertadas += 1;
      } catch (error) {
        result.fallidas += 1;
        result.errores.push({
          fila: row.line,
          error: (error as Error).message,
        });
      }
    }

    return result;
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

  private async mapCsvRowToDto(row: CsvPeliculaRow): Promise<CreatePeliculaDto> {
    const titulo = row.titulo?.trim();
    const idCategoria = await this.resolveCategoriaId(row);
    const idTipoCartelera = await this.resolveTipoCarteleraId(row);

    if (!titulo) {
      throw new BadRequestException(
        'La columna titulo es obligatoria',
      );
    }

    return {
      titulo,
      sinopsis: row.sinopsis?.trim() || undefined,
      duracion_minutos: row.duracion_minutos
        ? this.parsePositiveNumber(row.duracion_minutos, 'duracion_minutos')
        : undefined,
      poster_url: row.poster_url?.trim() || undefined,
      id_categoria: idCategoria,
      id_tipo_cartelera: idTipoCartelera,
      activa: row.activa === undefined ? true : this.parseBoolean(row.activa),
    };
  }

  private async resolveCategoriaId(row: CsvPeliculaRow): Promise<string> {
    const idCategoria = row.id_categoria?.trim();
    if (idCategoria) {
      return idCategoria;
    }

    const categoriaNombre = row.categoria?.trim();
    if (!categoriaNombre) {
      throw new BadRequestException(
        'Debes enviar categoria o id_categoria en el CSV',
      );
    }

    const categoria = await this.categoriasService.findByNombre(categoriaNombre);
    return categoria.id;
  }

  private async resolveTipoCarteleraId(row: CsvPeliculaRow): Promise<string> {
    const idTipoCartelera = row.id_tipo_cartelera?.trim();
    if (idTipoCartelera) {
      return idTipoCartelera;
    }

    const tipoCarteleraNombre = row.tipo_cartelera?.trim();
    if (!tipoCarteleraNombre) {
      throw new BadRequestException(
        'Debes enviar tipo_cartelera o id_tipo_cartelera en el CSV',
      );
    }

    const tipoCartelera =
      await this.tipoCarteleraService.findByNombre(tipoCarteleraNombre);
    return tipoCartelera.id;
  }

  private parseCsv(content: string): Array<{ line: number; data: CsvPeliculaRow }> {
    const lines = content
      .replace(/^\uFEFF/, '')
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0);

    if (lines.length < 2) {
      return [];
    }

    const headers = this.parseCsvLine(lines[0]).map((header) =>
      header.trim().toLowerCase(),
    );

    return lines.slice(1).map((line, index) => {
      const values = this.parseCsvLine(line);
      const data = headers.reduce<Record<string, string>>((record, header, i) => {
        record[header] = values[i]?.trim() ?? '';
        return record;
      }, {});

      return {
        line: index + 2,
        data: data as unknown as CsvPeliculaRow,
      };
    });
  }

  private parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let quoted = false;

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"' && quoted && next === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = !quoted;
      } else if (char === ',' && !quoted) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    values.push(current);
    return values;
  }

  private parseBoolean(value: string): boolean {
    const normalized = value.trim().toLowerCase();

    if (['true', '1', 'si', 'activo', 'activa'].includes(normalized)) {
      return true;
    }

    if (['false', '0', 'no', 'inactivo', 'inactiva'].includes(normalized)) {
      return false;
    }

    throw new BadRequestException(`Valor booleano invalido para activa: ${value}`);
  }

  private parsePositiveNumber(value: string, field: string): number {
    const parsed = Number(value);

    if (!Number.isFinite(parsed) || parsed < 1) {
      throw new BadRequestException(`Valor numerico invalido para ${field}: ${value}`);
    }

    return parsed;
  }
}
