import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateAsientoDto } from './dto/create-asiento.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { CreateEstadoReservaDto } from './dto/create-estado-reserva.dto';
import { CreateReservaDto } from './dto/create-reserva.dto';
import { ReservasService } from './reservas.service';
import { PaginateTicketHistoryDto } from './dto/paginate-ticket-history.dto';
import { TicketHistoryService } from './services/ticket-history.service';
import { SearchAdminTicketsDto } from './dto/search-admin-tickets.dto';
import { AdminTicketSearchService } from './services/admin-ticket-search.service';
import { ValidateTicketDto } from './dto/validate-ticket.dto';
import { TicketValidationService } from './services/ticket-validation.service';
import { TicketDownloadService } from './services/ticket-download.service';

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
  constructor(
    private readonly reservasService: ReservasService,
    private readonly ticketHistoryService: TicketHistoryService,
    private readonly adminTicketSearchService: AdminTicketSearchService,
    private readonly ticketValidationService: TicketValidationService,
    private readonly ticketDownloadService: TicketDownloadService,
  ) {}

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

  @Get('mis-boletos')
  @UseGuards(JwtAuthGuard)
  findMyTickets(
    @Query() query: PaginateTicketHistoryDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketHistoryService.findByUser(
      getAuthenticatedUserId(request),
      query.page,
      query.limit,
    );
  }

  @Get('admin/boletos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  searchTickets(@Query() query: SearchAdminTicketsDto) {
    return this.adminTicketSearchService.search(query);
  }

  @Post('boletos/validar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  validateTicket(
    @Body() dto: ValidateTicketDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketValidationService.validateByCode(
      dto.codigo,
      getAuthenticatedUserId(request),
    );
  }

  @Post('boletos/:id/validar-manualmente')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  validateTicketManually(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketValidationService.validateManually(
      id,
      getAuthenticatedUserId(request),
    );
  }

  @Get('boletos/:id/descargar')
  @UseGuards(JwtAuthGuard)
  async downloadTicket(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() request: AuthenticatedRequest,
    @Res() response: Response,
  ) {
    const document = await this.ticketDownloadService.download(
      id,
      getAuthenticatedUserId(request),
      request.user?.rol,
    );

    response.setHeader('Content-Type', document.contentType);
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${document.filename}"`,
    );
    response.setHeader('Content-Length', document.content.length.toString());
    response.end(document.content);
  }

  @Get('internal/funciones/:id/boletos')
  async hasBoletosByFuncion(@Param('id', ParseUUIDPipe) id: string) {
    const hasBoletos = await this.reservasService.hasBoletosByFuncion(id);
    return { hasBoletos };
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
  confirmReserva(@Param('id', ParseUUIDPipe) id: string) {
    return this.reservasService.confirmReserva(id);
  }
}
