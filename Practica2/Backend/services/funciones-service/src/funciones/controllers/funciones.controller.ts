// En Backend/services/funciones-service/src/controllers/funciones.controller.ts

import {
  Body,
  Controller,
  Delete,  // <-- Agrega este import
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
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
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CreateFuncionDto) {
    return this.funcionesService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateFuncionDto) {
    return this.funcionesService.update(id, dto);
  }

  // ========== NUEVO ENDPOINT DELETE ==========
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.funcionesService.remove(id);
    return { message: `Función ${id} eliminada correctamente` };
  }
}