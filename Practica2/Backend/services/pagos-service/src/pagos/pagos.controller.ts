import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateEstadoPagoDto } from './dto/create-estado-pago.dto';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { CreatePagoDto } from './dto/create-pago.dto';
import { PagosService } from './pagos.service';

@Controller('pagos')
export class PagosController {
  constructor(private readonly pagosService: PagosService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'pagos-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metodos')
  @UseGuards(JwtAuthGuard)
  findMetodos() {
    return this.pagosService.findMetodos();
  }

  @Get('reserva/:id')
  @UseGuards(JwtAuthGuard)
  findPagosByReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findPagosByReserva(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findPago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findPagoById(id);
  }

  @Post('metodos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createMetodo(@Body() createMetodoDto: CreateMetodoPagoDto) {
    return this.pagosService.createMetodo(createMetodoDto);
  }

  @Post('estados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createEstado(@Body() createEstadoDto: CreateEstadoPagoDto) {
    return this.pagosService.createEstado(createEstadoDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createPago(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.createPago(createPagoDto);
  }

  @Post(':id/aprobar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  approvePago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.changeEstado(id, 'APROBADO');
  }

  @Post(':id/rechazar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  rejectPago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.changeEstado(id, 'RECHAZADO');
  }
}
