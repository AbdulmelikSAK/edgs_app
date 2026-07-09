import * as crypto from 'crypto';
if (!global.crypto) {
  (global as any).crypto = crypto;
}
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:8080', 'http://localhost:5173', '*'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('EDGS API')
    .setDescription('API REST pour la gestion des opérations EDGS (sablage)')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentification PIN')
    .addTag('employees', 'Employés terrain')
    .addTag('trucks', 'Camions')
    .addTag('clients', 'Clients')
    .addTag('worksites', 'Chantiers')
    .addTag('missions', 'Ordres de mission')
    .addTag('timeclock', 'Pointage')
    .addTag('gps', 'Géolocalisation')
    .addTag('photos', 'Photos chantier')
    .addTag('stock', 'Stock sacs de sable')
    .addTag('reports', 'Rapports PDF')
    .addTag('stats', 'Statistiques')
    .addTag('planning', 'Planning hebdomadaire')
    .addTag('users', 'Utilisateurs back-office')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 EDGS API running on http://localhost:${port}`);
  console.log(`📖 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
