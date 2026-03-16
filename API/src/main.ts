import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/errors/global-exception.filter';
import { ErrorLoggerService } from './common/errors/error-logger.service';
import { ErrorCatalogService } from './common/errors/error-catalog.service';
import { ResponseMapperInterceptor } from './common/response/response-mapper.interceptor';
import { RequestIdMiddleware } from './common/request/request-id.middleware';

async function bootstrap() {
  const isProd = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create(AppModule, {
    logger: isProd ? false : ['error', 'warn', 'log', 'debug', 'verbose'],
  });
  const logger = new Logger('Bootstrap');
  if (isProd) {
    // Re-enable minimal logging after boot (only errors/warnings)
    app.useLogger(['error', 'warn']);
  }

  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
        connectSrc: ["'self'"],
      },
    },
  }));
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true,
  });
  app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');

  // Request ID middleware (must be before interceptors/filters)
  const requestIdMiddleware = new RequestIdMiddleware();
  app.use((req: any, res: any, next: any) => requestIdMiddleware.use(req, res, next));

  // Global pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, forbidNonWhitelisted: true, transform: true,
    transformOptions: { enableImplicitConversion: true },
  }));

  // Global response interceptor (auto-wraps all responses)
  app.useGlobalInterceptors(new ResponseMapperInterceptor());

  // Global exception filter (standardizes all error responses)
  const errorLogger = app.get(ErrorLoggerService);
  const errorCatalog = app.get(ErrorCatalogService);
  app.useGlobalFilters(new GlobalExceptionFilter(errorLogger, errorCatalog));

  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('CRM Backend — CQRS + DDD Architecture')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication & Authorization')
    .addTag('Raw Contacts', 'Raw contact ingestion & verification workflow')
    .addTag('Organizations', 'Organization management')
    .addTag('Contacts', 'Verified contact management')
    .addTag('Leads', 'Lead pipeline management')
    .addTag('Tenant Config', 'Per-tenant configuration management')
    .addTag('Credentials', 'Credential store — encrypted API keys & tokens')
    .addTag('Credential Admin', 'Super admin — global default credentials & key rotation')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  // Swagger UI
  SwaggerModule.setup('docs', app, document);

  // Scalar API Reference
  app.use(
    '/scalar',
    apiReference({
      spec: { content: document },
      theme: 'kepler',
      layout: 'modern',
      defaultHttpClient: { targetKey: 'node', clientKey: 'fetch' },
      hideModels: false,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`Server:  http://localhost:${port}`);
  logger.log(`Swagger: http://localhost:${port}/docs`);
  logger.log(`Scalar:  http://localhost:${port}/scalar`);
}
bootstrap();
