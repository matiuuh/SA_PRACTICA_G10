import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SalasService } from '../services/salas.service';
import { CreateSalaDto } from '../dto/create-sala.dto';
import { UpdateSalaDto } from '../dto/update-sala.dto';

@Controller('salas')
export class SalasController {
  constructor(private readonly salasService: SalasService) {}

  @Get()
  findAll() {
    return this.salasService.findAll();
  }

  @Get('cine/:idCine')
  findByCine(@Param('idCine', ParseIntPipe) idCine: number) {
    return this.salasService.findByCine(idCine);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.salasService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateSalaDto) {
    return this.salasService.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSalaDto) {
    return this.salasService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.salasService.remove(id);
    return { message: `Sala #${id} eliminada correctamente` };
  }
}
