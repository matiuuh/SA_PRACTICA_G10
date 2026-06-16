import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
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

  @Get('cines/paginated')
  findCinesPaginated(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('idCiudad') idCiudad?: string,
  ) {
    return this.localidadesService.findCinesPaginated({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
      idCiudad,
    });
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

  @Patch('cines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  updateCine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCineDto: UpdateCineDto,
  ) {
    return this.localidadesService.updateCine(id, updateCineDto);
  }

  @Delete('cines/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCine(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.removeCine(id);
  }




  // Métodos adicionales al LocalidadesController

@Get('cines/:id')
findCineById(@Param('id', ParseUUIDPipe) id: string) {
  return this.localidadesService.findCineById(id);
}

@Get('salas')
findSalas() {
  return this.localidadesService.findSalas();
}

@Get('salas/:id')
findSalaById(@Param('id', ParseUUIDPipe) id: string) {
  return this.localidadesService.findSalaById(id);
}

  @Post('salas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createSala(@Body() createSalaDto: CreateSalaDto) {
    return this.localidadesService.createSala(createSalaDto);
  }
}
