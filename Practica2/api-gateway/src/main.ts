import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3006', 'http://localhost:3000'],
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
