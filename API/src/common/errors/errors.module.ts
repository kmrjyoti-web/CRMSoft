import { Global, Module } from '@nestjs/common';
import { ErrorCatalogService } from './error-catalog.service';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorAdminController } from './presentation/error-admin.controller';
import { FrontendErrorController } from './presentation/frontend-error.controller';

/**
 * Global error handling module.
 * Provides ErrorCatalogService and ErrorLoggerService to the entire app.
 */
@Global()
@Module({
  controllers: [ErrorAdminController, FrontendErrorController],
  providers: [ErrorCatalogService, ErrorLoggerService],
  exports: [ErrorCatalogService, ErrorLoggerService],
})
export class ErrorsModule {}
