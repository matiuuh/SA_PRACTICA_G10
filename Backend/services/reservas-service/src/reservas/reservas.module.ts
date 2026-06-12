import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { Asiento } from './entities/asiento.entity';
import { Boleto } from './entities/boleto.entity';
import { EstadoReserva } from './entities/estado-reserva.entity';
import { ReservaDetalle } from './entities/reserva-detalle.entity';
import { Reserva } from './entities/reserva.entity';
import { ReservasGateway } from './reservas.gateway';
import { RabbitMqService } from './rabbitmq.service';
import { ReservasPaymentsConsumer } from './reservas-payments.consumer';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Asiento,
      EstadoReserva,
      Reserva,
      ReservaDetalle,
      Boleto,
    ]),
  ],
  controllers: [ReservasController],
  providers: [
    ReservasService,
    RabbitMqService,
    ReservasPaymentsConsumer,
    ReservasGateway,
  ],
  exports: [ReservasService],
})
export class ReservasModule {}
