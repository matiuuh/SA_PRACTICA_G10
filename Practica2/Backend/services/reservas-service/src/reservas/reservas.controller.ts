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
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'reservas-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('funciones/:id/asientos')
  @UseGuards(JwtAuthGuard)
  // Lista los asientos asociados a una funcion externa.
  findAsientosByFuncion(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findAsientosByFuncion(id);
  }

  @Get('boletos/:id')
  @UseGuards(JwtAuthGuard)
  findBoleto(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findBoletoById(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findReservaById(id);
  }

  @Post('asientos')
  @UseGuards(JwtAuthGuard)
  createAsiento(@Body() createAsientoDto: CreateAsientoDto) {
    return this.reservasService.createAsiento(createAsientoDto);
  }

  @Post('estados')
  @UseGuards(JwtAuthGuard)
  createEstado(@Body() createEstadoDto: CreateEstadoReservaDto) {
    return this.reservasService.createEstado(createEstadoDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // Crea una reserva temporal usando asientos y usuario externo.
  createReserva(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.createReserva(createReservaDto);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  // Crea la reserva temporal y envia la solicitud de pago a RabbitMQ.
  createCheckout(@Body() createCheckoutDto: CreateCheckoutDto) {
    return this.reservasService.createCheckout(createCheckoutDto);
  }

  @Post(':id/confirmar')
  @UseGuards(JwtAuthGuard)
  // Cambia la reserva a confirmada y genera el boleto si no existe.
  confirmReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.confirmReserva(id);
  }
}
