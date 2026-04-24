import {
  ExceptionFilter, Catch, ArgumentsHost, HttpException, BadRequestException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AppError } from './app-error';
import { ERROR_CODES } from './error-codes';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    const traceId = request.requestId || randomUUID();

    let statusCode: number;
    let errorCode: string;
    let message: string;
    let suggestion: string;
    let details: any = null;

    if (exception instanceof AppError) {
      statusCode = exception.httpStatus;
      errorCode = exception.code;
      message = exception.message;
      suggestion = exception.suggestion;
      details = exception.details;
    } else if (exception instanceof BadRequestException) {
      const res = exception.getResponse() as any;
      statusCode = 400;
      errorCode = 'VALIDATION_ERROR';
      message = 'One or more fields have invalid values';
      suggestion = 'Check the details array for field-level errors and fix each one.';
      if (res.message && Array.isArray(res.message)) {
        details = res.message.map((msg: any) =>
          typeof msg === 'string' ? { field: 'unknown', message: msg } : msg,
        );
      }
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = mapHttpStatus(statusCode);
      message = exception.message;
      suggestion = ERROR_CODES[errorCode]?.suggestion || 'Check the request and try again.';
    } else {
      statusCode = 500;
      errorCode = 'INTERNAL_ERROR';
      message = 'An unexpected error occurred';
      suggestion = 'Contact support with the traceId.';
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      error: { code: errorCode, message, details, suggestion },
      timestamp: new Date().toISOString(),
      path: request.url,
      requestId: traceId,
    });
  }
}

function mapHttpStatus(status: number): string {
  const map: Record<number, string> = {
    400: 'INVALID_INPUT', 401: 'AUTH_TOKEN_INVALID', 403: 'FORBIDDEN',
    404: 'NOT_FOUND', 409: 'DUPLICATE_ENTRY', 422: 'INVALID_STATE',
    429: 'RATE_LIMIT_EXCEEDED', 503: 'SERVICE_UNAVAILABLE',
  };
  return map[status] || 'INTERNAL_ERROR';
}
