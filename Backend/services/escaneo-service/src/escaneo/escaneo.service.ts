import { HttpService } from '@nestjs/axios';
import { HttpException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EscaneoService {
  private readonly reservasUrl: string;
  private readonly internalToken: string;

  constructor(
    private readonly httpService: HttpService,
    configService: ConfigService,
  ) {
    this.reservasUrl = configService.get<string>(
      'RESERVAS_SERVICE_URL',
      'http://localhost:3004',
    );
    this.internalToken = configService.get<string>(
      'INTERNAL_SERVICE_TOKEN',
      'change_this_internal_secret',
    );
  }

  async validar(codigo: string, administradorId: string): Promise<unknown> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.reservasUrl}/api/reservas/internal/boletos/validar-escaneo`,
          { codigo: codigo.trim(), administradorId },
          { headers: { 'x-internal-service-token': this.internalToken } },
        ),
      );

      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        throw new HttpException(error.response.data, error.response.status);
      }

      throw new ServiceUnavailableException(
        'No se pudo comunicar con el servicio de reservas',
      );
    }
  }
}
