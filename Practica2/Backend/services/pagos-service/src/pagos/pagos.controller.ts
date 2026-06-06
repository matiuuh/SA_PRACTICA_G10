import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
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
  findMetodos() {
    return this.pagosService.findMetodos();
  }

  @Get('reserva/:id')
  findPagosByReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findPagosByReserva(id);
  }

  @Get(':id')
  findPago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.findPagoById(id);
  }

  @Post('metodos')
  createMetodo(@Body() createMetodoDto: CreateMetodoPagoDto) {
    return this.pagosService.createMetodo(createMetodoDto);
  }

  @Post('estados')
  createEstado(@Body() createEstadoDto: CreateEstadoPagoDto) {
    return this.pagosService.createEstado(createEstadoDto);
  }

  @Post()
  createPago(@Body() createPagoDto: CreatePagoDto) {
    return this.pagosService.createPago(createPagoDto);
  }

  @Post(':id/aprobar')
  approvePago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.changeEstado(id, 'APROBADO');
  }

  @Post(':id/rechazar')
  rejectPago(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagosService.changeEstado(id, 'RECHAZADO');
  }
}
