import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';

@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @Get('funciones/:id/asientos')
  // Lista los asientos asociados a una funcion externa.
  findAsientosByFuncion(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findAsientosByFuncion(id);
  }

  @Get('boletos/:id')
  findBoleto(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findBoletoById(id);
  }

  @Get(':id')
  findReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.findReservaById(id);
  }

  @Post('asientos')
  createAsiento(@Body() createAsientoDto: CreateAsientoDto) {
    return this.reservasService.createAsiento(createAsientoDto);
  }

  @Post('estados')
  createEstado(@Body() createEstadoDto: CreateEstadoReservaDto) {
    return this.reservasService.createEstado(createEstadoDto);
  }

  @Post()
  // Crea una reserva temporal usando asientos y usuario externo.
  createReserva(@Body() createReservaDto: CreateReservaDto) {
    return this.reservasService.createReserva(createReservaDto);
  }

  @Post(':id/confirmar')
  // Cambia la reserva a confirmada y genera el boleto si no existe.
  confirmReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.confirmReserva(id);
  }
}
