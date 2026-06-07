import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CreateTipoCarteleraDto) {
    return this.tipoCarteleraService.create(dto);
  }
}
