import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';

type AuthenticatedRequest = { user?: { id?: string; rol?: string } };
const getAuthenticatedUserId = (request: AuthenticatedRequest) => {
  if (!request.user?.id) {
    throw new UnauthorizedException('Token invalido o sin usuario');
  }

  return request.user.id;
};

const canAccessUserResource = (
  request: AuthenticatedRequest,
  ownerId: string,
) => request.user?.rol === 'ADMINISTRADOR' || request.user?.id === ownerId;

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
  findAsientosByFuncion(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reservasService.findAsientosByFuncion(id, getAuthenticatedUserId(request));
  }

  @Get('boletos/:id')
  @UseGuards(JwtAuthGuard)
  async findBoleto(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const boleto = await this.reservasService.findBoletoById(id);

    if (!canAccessUserResource(request, boleto.reserva.usuarioIdExterno)) {
      throw new ForbiddenException('No puedes consultar este boleto');
    }

    return boleto;
  }

  @Get('internal/funciones/:id/boletos')
  hasBoletosByFuncion(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.hasBoletosByFuncion(id).then((hasBoletos) => ({ hasBoletos }));
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findReserva(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const reserva = await this.reservasService.findReservaById(id);

    if (!canAccessUserResource(request, reserva.usuarioIdExterno)) {
      throw new ForbiddenException('No puedes consultar esta reserva');
    }

    return reserva;
  }

  @Post('asientos')
  @UseGuards(JwtAuthGuard)
  createAsiento(@Body() createAsientoDto: CreateAsientoDto) {
    return this.reservasService.createAsiento(createAsientoDto);
  }

  @Post('estados')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  createEstado(@Body() createEstadoDto: CreateEstadoReservaDto) {
    return this.reservasService.createEstado(createEstadoDto);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  // Crea una reserva temporal usando asientos y usuario externo.
  createReserva(
    @Body() createReservaDto: CreateReservaDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reservasService.createReserva({
      ...createReservaDto,
      usuarioIdExterno: getAuthenticatedUserId(request),
    });
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  // Crea la reserva temporal y envia la solicitud de pago a RabbitMQ.
  createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reservasService.createCheckout({
      ...createCheckoutDto,
      usuarioIdExterno: getAuthenticatedUserId(request),
    });
  }

  @Post(':id/confirmar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  // Cambia la reserva a confirmada y genera el boleto si no existe.
  confirmReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.confirmReserva(id);
  }
}
