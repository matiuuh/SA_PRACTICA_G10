import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  private readonly logger = new Logger(GatewayController.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly gatewayService: GatewayService,
  ) {}

  @All('*')
  async handleRequest(@Req() req: Request, @Res() res: Response) {
    const startTime = Date.now();
    const { method, originalUrl, body, query, headers, path } = req;
    
    // Ignorar health checks del gateway
    if (originalUrl === '/health') {
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: this.gatewayService.getServicesHealth(),
      });
    }

    this.logger.log(`📥 ${method} ${originalUrl}`);

    // Encontrar el servicio correspondiente
    const service = this.gatewayService.findService(path);
    
    if (!service) {
      this.logger.warn(`❌ Service not found for path: ${originalUrl}`);
      return res.status(404).json({
        statusCode: 404,
        message: 'Service not found',
        path: originalUrl,
        timestamp: new Date().toISOString(),
      });
    }

    const targetUrl = `${service.url}${path}`;
    
    // Preparar headers para reenviar
    const forwardHeaders = {
      ...headers,
      'X-Original-Url': originalUrl,
      'X-Original-Method': method,
      'X-Gateway-Request-Time': startTime.toString(),
    };
    
    // Eliminar headers que no deben reenviarse
    delete forwardHeaders.host;
    delete forwardHeaders['content-length'];

    try {
      // Reenviar petición al servicio
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          data: body,
          headers: forwardHeaders,
          params: query,
          timeout: 30000,
        })
      );

      const responseTime = Date.now() - startTime;
      this.logger.log(
        `✅ ${method} ${originalUrl} → ${service.name} (${response.status}) - ${responseTime}ms`
      );

      // Agregar headers de respuesta
      res.setHeader('X-Service-Name', service.name);
      res.setHeader('X-Response-Time', `${responseTime}ms`);
      res.status(response.status).json(response.data);
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      if (error.response) {
        // El servicio respondió con error
        this.logger.warn(
          `⚠️ ${method} ${originalUrl} → ${service.name} (${error.response.status}) - ${responseTime}ms`
        );
        res.status(error.response.status).json(error.response.data);
        
      } else if (error.code === 'ECONNREFUSED') {
        // Servicio no disponible
        this.logger.error(`❌ Service ${service.name} is unavailable on ${service.url}`);
        res.status(503).json({
          statusCode: 503,
          message: `Service ${service.name} is currently unavailable`,
          service: service.name,
          path: originalUrl,
          timestamp: new Date().toISOString(),
        });
        
      } else if (error.code === 'ETIMEDOUT') {
        // Timeout
        this.logger.error(`⏱️ Service ${service.name} timeout`);
        res.status(504).json({
          statusCode: 504,
          message: `Service ${service.name} timeout`,
          service: service.name,
          timeout: '30s',
          timestamp: new Date().toISOString(),
        });
        
      } else {
        // Error interno
        this.logger.error(`💥 Gateway error: ${error.message}`);
        res.status(500).json({
          statusCode: 500,
          message: 'Internal gateway error',
          error: error.message,
          timestamp: new Date().toISOString(),
        });
      }
    }
  }
}
