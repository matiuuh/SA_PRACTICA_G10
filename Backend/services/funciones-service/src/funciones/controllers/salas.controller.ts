import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { PaginateSalasDto } from '../dto/paginate-salas.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';
import { SalasService } from '../services/salas.service';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Get('paginated')
  findPaginated(@Query() query: PaginateSalasDto) {
    return this.salasService.findPaginated(query);
  }

  @Get()
  findAll() {
    return this.salasService.findAll();
  }

  @Get('cine/:idCine')
  findByCine(@Param('idCine', ParseUUIDPipe) idCine: string) {
    return this.salasService.findByCine(idCine);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.salasService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  create(@Body() dto: CreateSalaDto) {
    return this.salasService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSalaDto) {
    return this.salasService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMINISTRADOR')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.salasService.remove(id);
    return { message: `Sala ${id} eliminada correctamente` };
  }
}
