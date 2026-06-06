import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { jwtConstants } from './auth.constants';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterDto } from '../users/dto/register.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    // Evita correos duplicados antes de crear el usuario.
    const existingUser = await this.usersService.findByEmail(registerDto.correo);
    if (existingUser) {
      throw new ConflictException('El correo ya esta registrado');
    }

    // Nunca se guarda la contrasena en texto plano; solo su hash.
    const passwordHash = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      passwordHash,
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    // Login valida credenciales y devuelve el JWT junto con datos basicos del usuario.
    const user = await this.validateUser(loginDto.correo, loginDto.password);
    return this.buildAuthResponse(user);
  }

  async validateUser(correo: string, password: string): Promise<User> {
    // Busca al usuario por correo porque es el identificador usado para iniciar sesion.
    const user = await this.usersService.findByEmail(correo);

    if (!user) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    // Compara la contrasena recibida con el hash almacenado en la base de datos.
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Credenciales invalidas');
    }

    return user;
  }

  private buildAuthResponse(user: User): AuthResponseDto {
    // Estos claims son los que viajaran dentro del JWT.
    const payload: JwtPayload = {
      sub: user.id,
      name: user.nombre,
      email: user.correo,
      role: user.rol.nombre,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol.nombre,
      },
    };
  }

  getJwtConfig() {
    // Centraliza la configuracion del JWT para reutilizar secreto y expiracion.
    return {
      secret: this.configService.get<string>('JWT_SECRET', 'change_this_secret'),
      signOptions: {
        expiresIn: this.configService.get<string>(
          'JWT_EXPIRES_IN',
          jwtConstants.defaultExpiresIn,
        ),
      },
    };
  }
}
