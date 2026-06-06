import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalidadesController } from './localidades.controller';
import { LocalidadesService } from './localidades.service';
import { Cine } from './entities/cine.entity';
import { Ciudad } from './entities/ciudad.entity';
import { Sala } from './entities/sala.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ciudad, Cine, Sala])],
  controllers: [LocalidadesController],
  providers: [LocalidadesService],
  exports: [LocalidadesService],
})
export class LocalidadesModule {}
