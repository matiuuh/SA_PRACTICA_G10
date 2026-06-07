import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
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

  @Get('cines/:id')
  findCineById(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findCineById(id);
  }

  @Get('cines/:id/salas')
  findSalasByCine(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findSalasByCine(id);
  }

  @Get('salas/:id')
  findSalaById(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.findSalaById(id);
  }
}
