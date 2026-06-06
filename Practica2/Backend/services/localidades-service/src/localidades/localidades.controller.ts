import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { CreateSalaDto } from './dto/create-sala.dto';
import { LocalidadesService } from './localidades.service';

@Controller('localidades')
export class LocalidadesController {
  constructor(private readonly localidadesService: LocalidadesService) {}

  @Get('ciudades')
  // Lista las ciudades disponibles para el selector inicial del frontend.
  findCiudades() {
    return this.localidadesService.findCiudades();
  }

  @Get('ciudades/:id/cines')
  // Devuelve los cines de una ciudad especifica.
  findCinesByCiudad(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findCinesByCiudad(id);
  }

  @Get('cines/:id/salas')
  // Devuelve las salas fisicas asociadas a un cine.
  findSalasByCine(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findSalasByCine(id);
  }

  @Post('ciudades')
  createCiudad(@Body() createCiudadDto: CreateCiudadDto) {
    return this.localidadesService.createCiudad(createCiudadDto);
  }

  @Post('cines')
  createCine(@Body() createCineDto: CreateCineDto) {
    return this.localidadesService.createCine(createCineDto);
  }

  @Post('salas')
  createSala(@Body() createSalaDto: CreateSalaDto) {
    return this.localidadesService.createSala(createSalaDto);
  }
}
