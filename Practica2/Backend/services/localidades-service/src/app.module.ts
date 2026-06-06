import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cine } from './localidades/entities/cine.entity';
import { Ciudad } from './localidades/entities/ciudad.entity';
import { Sala } from './localidades/entities/sala.entity';
import { LocalidadesModule } from './localidades/localidades.module';

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
        database: configService.get<string>('DB_NAME', 'localidades_service'),
        entities: [Ciudad, Cine, Sala],
        synchronize: false,
      }),
    }),
    LocalidadesModule,
  ],
})
export class AppModule {}
