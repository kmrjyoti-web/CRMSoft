import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorCatalogService } from './error-catalog.service';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    private readonly errorLogger;
    private readonly errorCatalog?;
    constructor(errorLogger: ErrorLoggerService, errorCatalog?: ErrorCatalogService | undefined);
    catch(exception: unknown, host: ArgumentsHost): void;
    private getCatalogEntry;
    private mapHttpStatusToCode;
    private extractModuleFromPath;
    private handlePrismaError;
}
