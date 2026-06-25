import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ValidarEscaneoDto } from './dto/validar-escaneo.dto';
import { EscaneoService } from './escaneo.service';

type AuthenticatedRequest = { user?: { id?: string } };

@Controller('escaneo')
export class EscaneoController {
  constructor(private readonly escaneoService: EscaneoService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'escaneo-service',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('validar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  validar(
    @Body() dto: ValidarEscaneoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!request.user?.id) {
      throw new UnauthorizedException('Token invalido o sin usuario');
    }

    return this.escaneoService.validar(dto.codigo, request.user.id);
  }
}
