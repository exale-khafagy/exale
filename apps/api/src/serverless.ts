import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { INestApplication } from '@nestjs/common';

let app: INestApplication;

async function getApp() {
  if (!app) {
    app = await NestFactory.create(AppModule);
    const corsOrigins = process.env.CORS_ORIGIN?.split(',')
      .map((o) => o.trim())
      .filter(Boolean);
    app.enableCors({
      origin: corsOrigins?.length
        ? corsOrigins
        : [
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://dashboard.localhost:3000',
            'https://exale.net',
            'https://www.exale.net',
            'https://hub.exale.net',
            'https://dashboard.exale.net',
          ],
      credentials: true,
      methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    });
    await app.init();
  }
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: unknown, res: unknown) {
  const express = await getApp();
  return express(req, res);
}
