import * as Sentry from '@sentry/node';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

const dsn = process.env.SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV ?? 'development',
    tracesSampleRate: 0.1,
  });
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  const envOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const devOrigins = [
    'http://localhost:3000',
    'http://dashboard.localhost:3000',
    'http://127.0.0.1:3000',
  ];
  const productionOrigins = [
    'https://exale.net',
    'https://www.exale.net',
    'https://hub.exale.net',
    'https://api.exale.net',
    'https://dashboard.exale.net',
  ];
  const origins =
    process.env.NODE_ENV === 'development'
      ? [...new Set([...(envOrigins ?? []), ...devOrigins])]
      : (envOrigins?.length ? envOrigins : productionOrigins);
  app.enableCors({
    origin: origins.length ? origins : [...devOrigins, ...productionOrigins],
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    optionsSuccessStatus: 204,
  });
  const port = process.env.PORT ?? 3002;
  await app.listen(port);
}

bootstrap();
