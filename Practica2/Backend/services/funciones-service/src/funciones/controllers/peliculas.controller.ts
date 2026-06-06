import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { PeliculasService } from '../services/peliculas.service';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  findAll(@Query('tipo_cartelera') tipoCartelera?: string) {
    if (tipoCartelera) {
      return this.peliculasService.findByTipoCartelera(tipoCartelera);
    }

    return this.peliculasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.peliculasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePeliculaDto) {
    return this.peliculasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.peliculasService.remove(id);
    return { message: `Pelicula ${id} eliminada correctamente` };
  }
}
