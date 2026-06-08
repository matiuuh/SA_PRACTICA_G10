import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { services, ServiceConfig } from '../config/services.config';

export interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  url: string;
  responseTime?: number;
  lastCheck: Date;
}

@Injectable()
export class GatewayService {
  private readonly logger = new Logger(GatewayService.name);
  private servicesHealth: Map<string, ServiceHealth> = new Map();

  constructor(private readonly httpService: HttpService) {
    void this.runHealthChecks();
    this.startHealthChecks();
  }

  findService(path: string): ServiceConfig | undefined {
    return services.find(service =>
      service.routes.some(route => path.startsWith(route))
    );
  }

  async checkServiceHealth(service: ServiceConfig): Promise<ServiceHealth> {
    const start = Date.now();
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${service.url}${service.healthCheck}`, {
          timeout: 5000,
        })
      );
      
      const responseTime = Date.now() - start;
      
      return {
        name: service.name,
        status: 'healthy',
        url: service.url,
        responseTime,
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        name: service.name,
        status: 'unhealthy',
        url: service.url,
        lastCheck: new Date(),
      };
    }
  }

  private async runHealthChecks() {
    for (const service of services) {
      const health = await this.checkServiceHealth(service);
      this.servicesHealth.set(service.name, health);

      if (health.status === 'unhealthy') {
        this.logger.warn(`Service ${service.name} is unhealthy`);
      } else {
        this.logger.log(`Service ${service.name} is healthy (${health.responseTime}ms)`);
      }
    }
  }

  async startHealthChecks() {
    // Verificar salud cada 30 segundos
    setInterval(() => {
      void this.runHealthChecks();
    }, 30000);
  }

  getServicesHealth(): ServiceHealth[] {
    return Array.from(this.servicesHealth.values());
  }
}
