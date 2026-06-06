import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateTipoCarteleraDto } from '../dto/create-tipo-cartelera.dto';
import { TipoCarteleraService } from '../services/tipo-cartelera.service';

@Controller('tipo-cartelera')
export class TipoCarteleraController {
  constructor(private readonly tipoCarteleraService: TipoCarteleraService) {}

  @Get()
  findAll() {
    return this.tipoCarteleraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tipoCarteleraService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateTipoCarteleraDto) {
    return this.tipoCarteleraService.create(dto);
  }
}
