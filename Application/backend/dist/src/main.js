"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const nestjs_api_reference_1 = require("@scalar/nestjs-api-reference");
const helmet_1 = require("helmet");
const app_module_1 = require("./app.module");
const env_validator_1 = require("./common/config/env-validator");
const global_exception_filter_1 = require("./common/errors/global-exception.filter");
const error_logger_service_1 = require("./common/errors/error-logger.service");
const error_catalog_service_1 = require("./common/errors/error-catalog.service");
const response_mapper_interceptor_1 = require("./common/response/response-mapper.interceptor");
const request_id_middleware_1 = require("./common/request/request-id.middleware");
async function bootstrap() {
    if (process.env.NODE_ENV !== 'test')
        (0, env_validator_1.validateEnv)();
    const isProd = process.env.NODE_ENV === 'production';
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: isProd ? ['error', 'warn'] : ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const logger = new common_1.Logger('Bootstrap');
    app.use((0, helmet_1.default)({
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
        origin: process.env.CORS_ORIGINS?.trim()
            ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
            : true,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Industry-Code'],
    });
    app.setGlobalPrefix(process.env.API_PREFIX || 'api/v1');
    const requestIdMiddleware = new request_id_middleware_1.RequestIdMiddleware();
    app.use((req, res, next) => requestIdMiddleware.use(req, res, next));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true, forbidNonWhitelisted: true, transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalInterceptors(new response_mapper_interceptor_1.ResponseMapperInterceptor());
    const errorLogger = app.get(error_logger_service_1.ErrorLoggerService);
    const errorCatalog = app.get(error_catalog_service_1.ErrorCatalogService);
    app.useGlobalFilters(new global_exception_filter_1.GlobalExceptionFilter(errorLogger, errorCatalog));
    const config = new swagger_1.DocumentBuilder()
        .setTitle('CRM API')
        .setDescription('CRM Backend � CQRS + DDD Architecture')
        .setVersion('1.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication & Authorization')
        .addTag('Raw Contacts', 'Raw contact ingestion & verification workflow')
        .addTag('Organizations', 'Organization management')
        .addTag('Contacts', 'Verified contact management')
        .addTag('Leads', 'Lead pipeline management')
        .addTag('Tenant Config', 'Per-tenant configuration management')
        .addTag('Credentials', 'Credential store � encrypted API keys & tokens')
        .addTag('Credential Admin', 'Super admin � global default credentials & key rotation')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    app.use('/scalar', (0, nestjs_api_reference_1.apiReference)({
        spec: { content: document },
        theme: 'kepler',
        layout: 'modern',
        defaultHttpClient: { targetKey: 'node', clientKey: 'fetch' },
        hideModels: false,
    }));
    const port = process.env.PORT || 3000;
    await app.listen(port);
    new common_1.Logger('Bootstrap').log(`Server running on port ${port}`);
}
bootstrap().catch((err) => {
    console.error('FATAL: App failed to start', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map