import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Exception that carries an errorCode for catalog lookup.
 * When caught by GlobalExceptionFilter, the errorCode is used
 * to fetch Hindi messages, solutions, and helpUrl from ErrorCatalog.
 *
 * Usage:
 *   throw CatalogException.badRequest('CONTACT_DUPLICATE');
 *   throw CatalogException.notFound('LEAD_NOT_FOUND', { leadId: '123' });
 *   throw CatalogException.conflict('DUPLICATE_ENTRY', { field: 'email' });
 */
export class CatalogException extends HttpException {
  constructor(
    status: number,
    errorCode: string,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(
      {
        errorCode,
        message: message || errorCode,
        details,
      },
      status,
    );
  }

  static badRequest(errorCode: string, message?: string, details?: Record<string, unknown>): CatalogException {
    return new CatalogException(HttpStatus.BAD_REQUEST, errorCode, message, details);
  }

  static unauthorized(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.UNAUTHORIZED, errorCode, message);
  }

  static forbidden(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.FORBIDDEN, errorCode, message);
  }

  static notFound(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.NOT_FOUND, errorCode, message);
  }

  static conflict(errorCode: string, message?: string, details?: Record<string, unknown>): CatalogException {
    return new CatalogException(HttpStatus.CONFLICT, errorCode, message, details);
  }

  static gone(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.GONE, errorCode, message);
  }

  static tooManyRequests(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.TOO_MANY_REQUESTS, errorCode, message);
  }

  static internal(errorCode: string, message?: string): CatalogException {
    return new CatalogException(HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
  }
}
