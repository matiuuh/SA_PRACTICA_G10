import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const logger = new Logger('Bootstrap');

  // Re-add body parsers only for non-multipart requests so that multipart
  // streams (CSV uploads) pass through raw and can be piped to the backend.
  app.use((req: any, res: any, next: any) => {
    const ct: string = req.headers['content-type'] || '';
    if (ct.includes('multipart/form-data')) {
      return next();
    }
    express.json({ limit: '10mb' })(req, res, () =>
      express.urlencoded({ extended: true, limit: '10mb' })(req, res, next),
    );
  });

  // Habilitar CORS para el frontend
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3006',
    'http://localhost:3000',
  ];

  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) allowedOrigins.push(frontendUrl);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Service-Name'],
  });

  const port = process.env.PORT || 3006;
  await app.listen(port);

  logger.log(`🚀 API Gateway running on http://localhost:${port}`);
  logger.log(`📡 CORS enabled for http://localhost:5173`);
}

bootstrap();
