import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { TipoCarteleraService } from '../services/tipo-cartelera.service';
import { CreateTipoCarteleraDto } from '../dto/create-tipo-cartelera.dto';

@Controller('tipo-cartelera')
export class TipoCarteleraController {
  constructor(private readonly tipoCarteleraService: TipoCarteleraService) {}

  @Get()
  findAll() {
    return this.tipoCarteleraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tipoCarteleraService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTipoCarteleraDto) {
    return this.tipoCarteleraService.create(dto);
  }
}
