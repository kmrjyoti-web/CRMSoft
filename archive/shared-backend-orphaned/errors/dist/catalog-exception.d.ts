import { HttpException } from '@nestjs/common';
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
export declare class CatalogException extends HttpException {
    constructor(status: number, errorCode: string, message?: string, details?: Record<string, unknown>);
    static badRequest(errorCode: string, message?: string, details?: Record<string, unknown>): CatalogException;
    static unauthorized(errorCode: string, message?: string): CatalogException;
    static forbidden(errorCode: string, message?: string): CatalogException;
    static notFound(errorCode: string, message?: string): CatalogException;
    static conflict(errorCode: string, message?: string, details?: Record<string, unknown>): CatalogException;
    static gone(errorCode: string, message?: string): CatalogException;
    static tooManyRequests(errorCode: string, message?: string): CatalogException;
    static internal(errorCode: string, message?: string): CatalogException;
}
//# sourceMappingURL=catalog-exception.d.ts.map