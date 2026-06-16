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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CreatePeliculaDto } from '../dto/create-pelicula.dto';
import { PaginatePeliculasDto } from '../dto/paginate-peliculas.dto';
import { UpdatePeliculaDto } from '../dto/update-pelicula.dto';
import { PeliculasService } from '../services/peliculas.service';

@Controller('peliculas')
export class PeliculasController {
  constructor(private readonly peliculasService: PeliculasService) {}

  @Get()
  findAll(@Query() query: PaginatePeliculasDto) {
    return this.peliculasService.findPaginated(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.peliculasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CreatePeliculaDto) {
    return this.peliculasService.create(dto);
  }

  @Post('carga-csv')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @UseInterceptors(FileInterceptor('file'))
  importCsv(@UploadedFile() file: any) {
    return this.peliculasService.importCsv(file);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdatePeliculaDto) {
    return this.peliculasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.peliculasService.remove(id);
    return { message: `Pelicula ${id} eliminada correctamente` };
  }
}
