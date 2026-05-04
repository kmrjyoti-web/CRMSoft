import { Global, Module } from '@nestjs/common';
import { ErrorCatalogService } from './error-catalog.service';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorAutoReportService } from './error-auto-report.service';
import { ErrorAdminController } from './presentation/error-admin.controller';
import { FrontendErrorController } from './presentation/frontend-error.controller';

/**
 * Global error handling module.
 * Provides ErrorCatalogService, ErrorLoggerService, and ErrorAutoReportService to the entire app.
 */
@Global()
@Module({
  controllers: [ErrorAdminController, FrontendErrorController],
  providers: [
    ErrorCatalogService,
    ErrorAutoReportService,
    {
      provide: 'ErrorAutoReportService',
      useExisting: ErrorAutoReportService,
    },
    ErrorLoggerService,
  ],
  exports: [ErrorCatalogService, ErrorLoggerService, ErrorAutoReportService],
})
export class ErrorsModule {}
