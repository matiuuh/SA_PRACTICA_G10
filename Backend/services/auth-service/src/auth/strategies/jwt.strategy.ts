import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Extrae el token del header Authorization: Bearer <token>.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'change_this_secret',
      ),
    });
  }

  validate(payload: JwtPayload) {
    // Lo que retornamos aqui queda disponible como req.user en rutas protegidas.
    return {
      id: payload.sub,
      nombre: payload.name,
      correo: payload.email,
      rol: payload.role,
    };
  }
}
