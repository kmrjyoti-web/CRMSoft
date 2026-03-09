import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';
import { ErrorLoggerService } from './error-logger.service';
import { ErrorCatalogService, CatalogEntry } from './error-catalog.service';
import { ApiStandardResponse } from '../response/api-response.interface';

/**
 * GLOBAL exception filter.
 * Catches ALL errors (AppError, HttpException, ValidationPipe, Prisma, unknown)
 * and returns the standard error response format with traceId + catalog i18n.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly errorLogger: ErrorLoggerService,
    private readonly errorCatalog?: ErrorCatalogService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    // Generate trace ID (use existing requestId or create UUID v4)
    const traceId = request.requestId || randomUUID();
    request.requestId = traceId;

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let suggestion: string;
    let details: any = null;
    let layer: 'BE' | 'FE' | 'DB' | 'MOB' = 'BE';
    let severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL' = 'ERROR';

    // CASE 1: AppError (our custom error)
    if (exception instanceof AppError) {
      statusCode = exception.httpStatus;
      errorCode = exception.code;
      message = exception.message;
      suggestion = exception.suggestion;
      details = exception.details;
    }
    // CASE 2: NestJS ValidationPipe errors (BadRequestException with class-validator)
    else if (exception instanceof BadRequestException) {
      const exceptionResponse = exception.getResponse() as any;
      statusCode = 400;
      errorCode = 'VALIDATION_ERROR';
      message = 'One or more fields have invalid values';
      suggestion =
        'Check the details array for field-level errors and fix each one.';
      severity = 'WARNING';

      if (
        exceptionResponse.message &&
        Array.isArray(exceptionResponse.message)
      ) {
        details = exceptionResponse.message.map((msg: any) => {
          if (typeof msg === 'string') {
            return { field: 'unknown', message: msg };
          }
          return msg;
        });
      } else if (typeof exceptionResponse.message === 'string') {
        details = [{ field: 'unknown', message: exceptionResponse.message }];
      }
    }
    // CASE 3: Other NestJS HttpException
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = this.mapHttpStatusToCode(statusCode);
      message = exception.message;
      suggestion =
        ERROR_CODES[errorCode]?.suggestion || 'Check the request and try again.';
      severity = statusCode >= 500 ? 'ERROR' : 'WARNING';
    }
    // CASE 4: Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaResult = this.handlePrismaError(exception);
      statusCode = prismaResult.statusCode;
      errorCode = prismaResult.errorCode;
      message = prismaResult.message;
      suggestion = prismaResult.suggestion;
      layer = 'DB';
    }
    // CASE 5: Unknown errors
    else {
      statusCode = 500;
      errorCode = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
      suggestion = 'Contact support with the traceId.';
      severity = 'CRITICAL';
    }

    // Try to enrich from ErrorCatalog (non-blocking)
    let messageHi: string | undefined;
    let suggestionHi: string | undefined;
    let helpUrl: string | undefined;
    let isRetryable = false;
    let retryAfterMs: number | undefined;

    const catalogEntry = this.getCatalogEntry(errorCode);
    if (catalogEntry) {
      // Use catalog message if available (don't override AppError's interpolated message)
      if (!(exception instanceof AppError)) {
        message = catalogEntry.messageEn;
      }
      if (catalogEntry.solutionEn) {
        suggestion = catalogEntry.solutionEn;
      }
      messageHi = catalogEntry.messageHi || undefined;
      suggestionHi = catalogEntry.solutionHi || undefined;
      helpUrl = catalogEntry.helpUrl || undefined;
      isRetryable = catalogEntry.isRetryable;
      retryAfterMs = catalogEntry.retryAfterMs || undefined;
      layer = catalogEntry.layer as any;
      severity = catalogEntry.severity as any;
    }

    // Get preferred language from header
    const acceptLang = request.headers?.['accept-language'] || '';
    const preferHindi = acceptLang.includes('hi');

    // BUILD RESPONSE
    const errorResponse: ApiStandardResponse = {
      success: false,
      statusCode,
      message: preferHindi && messageHi ? messageHi : message,
      error: {
        code: errorCode,
        message,
        messageHi,
        details,
        suggestion,
        suggestionHi,
        documentationUrl: `/docs/errors#${errorCode}`,
        helpUrl,
        isRetryable,
        retryAfterMs,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: traceId,
    };

    // LOG ERROR (fire-and-forget)
    this.errorLogger.log({
      requestId: traceId,
      errorCode,
      message,
      statusCode,
      path: request.url,
      method: request.method,
      layer,
      severity,
      userId: request.user?.id,
      tenantId: request.user?.tenantId,
      details,
      stack: exception instanceof Error ? exception.stack : undefined,
      ip: request.ip,
      userAgent: request.headers?.['user-agent'],
      module: this.extractModuleFromPath(request.url),
      requestBody: request.body,
      queryParams: request.query,
    });

    // SEND RESPONSE
    response.status(statusCode).json(errorResponse);
  }

  /** Synchronous catalog lookup (cache is in-memory). */
  private getCatalogEntry(code: string): CatalogEntry | null {
    if (!this.errorCatalog) return null;
    // Access the in-memory cache synchronously via the map
    // The ensureFresh() call is async but the cache is always available
    return (this.errorCatalog as any).cache?.get(code) ?? null;
  }

  private mapHttpStatusToCode(status: number): string {
    switch (status) {
      case 400:
        return 'INVALID_INPUT';
      case 401:
        return 'AUTH_TOKEN_INVALID';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 409:
        return 'DUPLICATE_ENTRY';
      case 422:
        return 'INVALID_STATE';
      case 429:
        return 'RATE_LIMIT_EXCEEDED';
      case 503:
        return 'SERVICE_UNAVAILABLE';
      default:
        return 'INTERNAL_ERROR';
    }
  }

  /** Extract module name from request path. */
  private extractModuleFromPath(path: string): string {
    const match = path?.match(/\/api\/v\d+\/([^\/]+)/);
    return match ? match[1] : 'unknown';
  }

  private handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
    statusCode: number;
    errorCode: string;
    message: string;
    suggestion: string;
  } {
    switch (error.code) {
      case 'P2002': {
        const fields =
          (error.meta?.target as string[])?.join(', ') || 'unknown field';
        return {
          statusCode: 409,
          errorCode: 'DUPLICATE_ENTRY',
          message: `A record with the same ${fields} already exists`,
          suggestion: `Check for existing records with the same ${fields}.`,
        };
      }
      case 'P2025':
        return {
          statusCode: 404,
          errorCode: 'NOT_FOUND',
          message: 'The requested record was not found',
          suggestion: 'Verify the ID exists.',
        };
      case 'P2003':
        return {
          statusCode: 400,
          errorCode: 'INVALID_INPUT',
          message: 'Referenced record does not exist',
          suggestion: 'Verify all referenced IDs (foreign keys) exist.',
        };
      default:
        return {
          statusCode: 500,
          errorCode: 'OPERATION_FAILED',
          message: 'Database operation failed',
          suggestion: 'Retry the request. If persists, contact support.',
        };
    }
  }
}
