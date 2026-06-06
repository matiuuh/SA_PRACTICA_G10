import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { jwtConstants } from './auth.constants';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    PassportModule,
    // Configura el servicio que firma los JWT usando variables de entorno.
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET', 'change_this_secret'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
            jwtConstants.defaultExpiresIn,
          ),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  // JwtStrategy se encarga de validar tokens en rutas protegidas.
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
