import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LocalidadesService } from './localidades.service';
import { CreateCiudadDto } from './dto/create-ciudad.dto';
import { CreateCineDto } from './dto/create-cine.dto';
import { CreateSalaDto } from './dto/create-sala.dto';
import { UpdateCiudadDto } from './dto/update-ciudad.dto';
import { UpdateCineDto } from './dto/update-cine.dto';
import { UpdateSalaDto } from './dto/update-sala.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMINISTRADOR')
@Controller('admin/localidades')
export class AdminLocalidadesController {
  constructor(private readonly localidadesService: LocalidadesService) {}

  // ─── Ciudades ─────────────────────────────────────────────────────

  @Post('ciudades')
  createCiudad(@Body() dto: CreateCiudadDto) {
    return this.localidadesService.createCiudad(dto);
  }

  @Patch('ciudades/:id')
  updateCiudad(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCiudadDto,
  ) {
    return this.localidadesService.updateCiudad(id, dto);
  }

  @Delete('ciudades/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCiudad(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.removeCiudad(id);
  }

  // ─── Cines ────────────────────────────────────────────────────────

  @Post('cines')
  createCine(@Body() dto: CreateCineDto) {
    return this.localidadesService.createCine(dto);
  }

  @Patch('cines/:id')
  updateCine(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCineDto,
  ) {
    return this.localidadesService.updateCine(id, dto);
  }

  @Delete('cines/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCine(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.removeCine(id);
  }

  // ─── Salas ────────────────────────────────────────────────────────

  @Post('salas')
  createSala(@Body() dto: CreateSalaDto) {
    return this.localidadesService.createSala(dto);
  }

  @Patch('salas/:id')
  updateSala(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalaDto,
  ) {
    return this.localidadesService.updateSala(id, dto);
  }

  @Delete('salas/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSala(@Param('id', ParseUUIDPipe) id: string) {
    return this.localidadesService.removeSala(id);
  }
}
