import { Controller, All, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GatewayService } from './gateway.service';
import * as http from 'http';
import * as https from 'https';

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

    this.logger.log(` ${method} ${originalUrl}`);

    // Encontrar el servicio correspondiente
    const service = this.gatewayService.findService(path);
    
    if (!service) {
      this.logger.warn(` Service not found for path: ${originalUrl}`);
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
      const contentType = headers['content-type'] || '';
      const isMultipart =
        typeof contentType === 'string' && contentType.includes('multipart/form-data');

      if (isMultipart) {
        // Para multipart/form-data se hace pipe del stream crudo para preservar
        // el boundary y los buffers de archivo sin que Axios los reserialice.
        const targetUrlObj = new URL(targetUrl);
        const transport = targetUrlObj.protocol === 'https:' ? https : http;

        await new Promise<void>((resolve, reject) => {
          const proxyReq = transport.request(
            {
              hostname: targetUrlObj.hostname,
              port: targetUrlObj.port || (targetUrlObj.protocol === 'https:' ? 443 : 80),
              path: targetUrlObj.pathname + (targetUrlObj.search ?? ''),
              method,
              headers: {
                ...forwardHeaders,
                host: targetUrlObj.host,
              },
            },
            (proxyRes) => {
              const responseTime = Date.now() - startTime;
              this.logger.log(
                ` ${method} ${originalUrl} → ${service.name} (${proxyRes.statusCode}) - ${responseTime}ms`,
              );

              const chunks: Buffer[] = [];
              proxyRes.on('data', (chunk: Buffer) => chunks.push(chunk));
              proxyRes.on('end', () => {
                const raw = Buffer.concat(chunks).toString('utf8');
                let data: unknown;
                try {
                  data = JSON.parse(raw);
                } catch {
                  data = raw;
                }
                res.setHeader('X-Service-Name', service.name);
                res.setHeader('X-Response-Time', `${responseTime}ms`);
                res.status(proxyRes.statusCode ?? 200).json(data);
                resolve();
              });
              proxyRes.on('error', reject);
            },
          );

          proxyReq.on('error', reject);
          req.pipe(proxyReq);
        });

        return;
      }

      // Reenviar petición JSON/form-urlencoded al servicio
      const response = await firstValueFrom(
        this.httpService.request({
          method,
          url: targetUrl,
          data: body,
          headers: forwardHeaders,
          params: query,
          timeout: 30000,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
        })
      );

      const responseTime = Date.now() - startTime;
      this.logger.log(
        ` ${method} ${originalUrl} → ${service.name} (${response.status}) - ${responseTime}ms`
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
          ` ${method} ${originalUrl} → ${service.name} (${error.response.status}) - ${responseTime}ms`
        );
        res.status(error.response.status).json(error.response.data);
        
      } else if (error.code === 'ECONNREFUSED') {
        // Servicio no disponible
        this.logger.error(` Service ${service.name} is unavailable on ${service.url}`);
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
