import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPago } from './entities/estado-pago.entity';
import { MetodoPago } from './entities/metodo-pago.entity';
import { Pago } from './entities/pago.entity';
import { Transaccion } from './entities/transaccion.entity';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetodoPago, EstadoPago, Pago, Transaccion]),
  ],
  controllers: [PagosController],
  providers: [PagosService],
  exports: [PagosService],
})
export class PagosModule {}
