import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReservasModule } from './reservas/reservas.module';
import { Asiento } from './reservas/entities/asiento.entity';
import { Boleto } from './reservas/entities/boleto.entity';
import { EstadoReserva } from './reservas/entities/estado-reserva.entity';
import { ReservaDetalle } from './reservas/entities/reserva-detalle.entity';
import { Reserva } from './reservas/entities/reserva.entity';
import { Incidencia } from './reservas/entities/incidencia.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'reservas_service'),
        entities: [
          Asiento,
          EstadoReserva,
          Reserva,
          ReservaDetalle,
          Boleto,
          Incidencia,
        ],
        synchronize: false,
      }),
    }),
    ReservasModule,
  ],
})
export class AppModule {}
