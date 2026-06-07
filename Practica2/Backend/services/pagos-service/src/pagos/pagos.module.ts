import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstadoPago } from './entities/estado-pago.entity';
import { MetodoPago } from './entities/metodo-pago.entity';
import { Pago } from './entities/pago.entity';
import { Transaccion } from './entities/transaccion.entity';
import { PagosQueueConsumer } from './pagos-queue.consumer';
import { PagosController } from './pagos.controller';
import { PagosService } from './pagos.service';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MetodoPago, EstadoPago, Pago, Transaccion]),
  ],
  controllers: [PagosController],
  providers: [PagosService, RabbitMqService, PagosQueueConsumer],
  exports: [PagosService],
})
export class PagosModule {}
