import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalidadesController } from './localidades.controller';
import { LocalidadesService } from './localidades.service';
import { Cine } from './entities/cine.entity';
import { Ciudad } from './entities/ciudad.entity';
import { Sala } from './entities/sala.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Ciudad, Cine, Sala])],
  controllers: [LocalidadesController],
  providers: [LocalidadesService],
  exports: [LocalidadesService],
})
export class LocalidadesModule {}
