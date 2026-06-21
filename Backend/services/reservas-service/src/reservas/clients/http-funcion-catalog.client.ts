import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FuncionCatalogClient,
  FuncionSnapshot,
} from '../interfaces/funcion-snapshot.interface';

interface FuncionApiResponse {
  id: string;
  fecha: string;
  hora: string;
  pelicula: {
    id: string;
    titulo: string;
  };
  sala: {
    nombre: string;
  };
}

@Injectable()
export class HttpFuncionCatalogClient implements FuncionCatalogClient {
  private readonly logger = new Logger(HttpFuncionCatalogClient.name);

  constructor(private readonly configService: ConfigService) {}

  async findSnapshotById(funcionId: string): Promise<FuncionSnapshot | null> {
    const baseUrl = this.configService.get<string>(
      'FUNCIONES_SERVICE_URL',
      'http://funciones-service:3003',
    );

    try {
      const response = await fetch(`${baseUrl}/api/funciones/${funcionId}`, {
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        this.logger.warn(
          `No se pudo obtener la funcion ${funcionId}: HTTP ${response.status}`,
        );
        return null;
      }

      const funcion = (await response.json()) as FuncionApiResponse;

      return {
        funcionId: funcion.id,
        peliculaId: funcion.pelicula.id,
        peliculaTitulo: funcion.pelicula.titulo,
        fechaFuncion: funcion.fecha,
        horaFuncion: funcion.hora,
        salaNombre: funcion.sala.nombre,
      };
    } catch (error) {
      this.logger.warn(
        `No se pudo obtener la funcion ${funcionId}: ${
          error instanceof Error ? error.message : 'error desconocido'
        }`,
      );
      return null;
    }
  }
}
