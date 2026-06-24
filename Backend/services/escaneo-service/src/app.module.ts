import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { EscaneoController } from './escaneo/escaneo.controller';
import { EscaneoService } from './escaneo/escaneo.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    HttpModule.register({ timeout: 10000, maxRedirects: 0 }),
    AuthModule,
  ],
  controllers: [EscaneoController],
  providers: [EscaneoService],
})
export class AppModule {}
