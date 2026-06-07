import { Body, Controller, Get, Param, ParseUUIDPipe, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { CreateSalaDto } from './dto/create-sala.dto';
import { LocalidadesService } from './localidades.service';

@Controller('localidades')
export class LocalidadesController {
  constructor(private readonly localidadesService: LocalidadesService) {}

  @Get('health')
  health() {
    return { status: 'ok', service: 'localidades-service', timestamp: new Date().toISOString() };
  }

  @Get('ciudades')
  findCiudades() {
    return this.localidadesService.findCiudades();
  }

  @Get('ciudades/:id')
  findCiudadById(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findCiudadById(id);
  }

  @Get('ciudades/:id/cines')
  findCinesByCiudad(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findCinesByCiudad(id);
  }

  @Get('cines')
  findCines() {
    return this.localidadesService.findCines();
  }

  @Post('ciudades')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createCiudad(@Body() createCiudadDto: CreateCiudadDto) {
    return this.localidadesService.createCiudad(createCiudadDto);
  }

  @Post('cines')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createCine(@Body() createCineDto: CreateCineDto) {
    return this.localidadesService.createCine(createCineDto);
  }

  @Post('salas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createSala(@Body() createSalaDto: CreateSalaDto) {
    return this.localidadesService.createSala(createSalaDto);
  }
}
