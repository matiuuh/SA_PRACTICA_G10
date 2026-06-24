import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  private readonly expectedToken: string;

  constructor(configService: ConfigService) {
    this.expectedToken = configService.get<string>(
      'INTERNAL_SERVICE_TOKEN',
      'change_this_internal_secret',
    );
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const supplied = request.headers['x-internal-service-token'];
    const token = Array.isArray(supplied) ? supplied[0] : supplied;

    if (!token || !this.isEqual(token, this.expectedToken)) {
      throw new UnauthorizedException('Credenciales internas invalidas');
    }

    return true;
  }

  private isEqual(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);

    return (
      leftBuffer.length === rightBuffer.length &&
      timingSafeEqual(leftBuffer, rightBuffer)
    );
  }
}
