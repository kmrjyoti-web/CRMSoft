import { HttpException } from '@nestjs/common';
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
