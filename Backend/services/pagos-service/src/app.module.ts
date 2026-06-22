import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagosModule } from './pagos/pagos.module';
import { EstadoPago } from './pagos/entities/estado-pago.entity';
import { MetodoPago } from './pagos/entities/metodo-pago.entity';
import { Pago } from './pagos/entities/pago.entity';
import { Transaccion } from './pagos/entities/transaccion.entity';

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
        database: configService.get<string>('DB_NAME', 'pagos_service'),
        entities: [MetodoPago, EstadoPago, Pago, Transaccion],
        synchronize: true,
      }),
    }),
    PagosModule,
  ],
})
export class AppModule {}
