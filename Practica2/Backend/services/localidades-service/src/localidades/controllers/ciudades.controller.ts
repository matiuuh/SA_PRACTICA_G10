import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { CiudadesService } from '../services/ciudades.service';

@Controller('localidades')
export class CiudadesController {
  constructor(private readonly ciudadesService: CiudadesService) {}

  @Get('ciudades')
  async getCiudades() {
    return this.ciudadesService.findAll();
  }

  @Post('ciudades')  // ← Agrega este método
  @HttpCode(HttpStatus.CREATED)
  async createCiudad(@Body() createCiudadDto: { nombre: string }) {
    return this.ciudadesService.create(createCiudadDto);
  }
}