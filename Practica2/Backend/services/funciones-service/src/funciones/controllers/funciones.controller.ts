import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateFuncionDto } from '../dto/create-funcion.dto';
import { UpdateFuncionDto } from '../dto/update-funcion.dto';
import { FuncionesService } from '../services/funciones.service';

@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'funciones-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get()
  findAll(
    @Query('sala') sala?: string,
    @Query('pelicula') pelicula?: string,
    @Query('cine') cine?: string,
  ) {
    if (sala) return this.funcionesService.findBySala(sala);
    if (pelicula) return this.funcionesService.findByPelicula(pelicula);
    if (cine) return this.funcionesService.findByCine(cine);
    return this.funcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.funcionesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFuncionDto) {
    return this.funcionesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFuncionDto) {
    return this.funcionesService.update(id, dto);
  }
}
