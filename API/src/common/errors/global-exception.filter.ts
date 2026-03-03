import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';
import { ErrorLoggerService } from './error-logger.service';
import { ApiStandardResponse } from '../response/api-response.interface';

/**
 * GLOBAL exception filter.
 * Catches ALL errors (AppError, HttpException, ValidationPipe, Prisma, unknown)
 * and returns the standard error response format.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly errorLogger: ErrorLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let suggestion: string;
    let details: any = null;

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
    }
    // CASE 4: Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const prismaResult = this.handlePrismaError(exception);
      statusCode = prismaResult.statusCode;
      errorCode = prismaResult.errorCode;
      message = prismaResult.message;
      suggestion = prismaResult.suggestion;
    }
    // CASE 5: Unknown errors
    else {
      statusCode = 500;
      errorCode = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
      suggestion = 'Contact support with the requestId.';
    }

    // BUILD RESPONSE
    const errorResponse: ApiStandardResponse = {
      success: false,
      statusCode,
      message,
      error: {
        code: errorCode,
        message,
        details,
        suggestion,
        documentationUrl: `/docs/errors#${errorCode}`,
      },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: request.requestId || 'unknown',
    };

    // LOG ERROR
    this.errorLogger.log({
      requestId: request.requestId,
      errorCode,
      message,
      statusCode,
      path: request.url,
      method: request.method,
      userId: request.user?.id,
      tenantId: request.user?.tenantId,
      details,
      stack: exception instanceof Error ? exception.stack : undefined,
      ip: request.ip,
      userAgent: request.headers?.['user-agent'],
    });

    // SEND RESPONSE
    response.status(statusCode).json(errorResponse);
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
