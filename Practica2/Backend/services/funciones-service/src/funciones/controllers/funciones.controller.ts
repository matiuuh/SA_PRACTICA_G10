import { Controller, Get, Post, Put, Body, Param, ParseIntPipe, Query } from '@nestjs/common';
import { FuncionesService } from '../services/funciones.service';
import { CreateFuncionDto } from '../dto/create-funcion.dto';
import { UpdateFuncionDto } from '../dto/update-funcion.dto';

@Controller('funciones')
export class FuncionesController {
  constructor(private readonly funcionesService: FuncionesService) {}

  @Get()
  findAll(
    @Query('sala') sala?: string,
    @Query('pelicula') pelicula?: string,
    @Query('cine') cine?: string,
  ) {
    if (sala) return this.funcionesService.findBySala(+sala);
    if (pelicula) return this.funcionesService.findByPelicula(+pelicula);
    if (cine) return this.funcionesService.findByCine(+cine);
    return this.funcionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.funcionesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateFuncionDto) {
    return this.funcionesService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFuncionDto) {
    return this.funcionesService.update(id, dto);
  }
}
