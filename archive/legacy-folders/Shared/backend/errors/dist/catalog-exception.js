"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CatalogException = void 0;
const common_1 = require("@nestjs/common");
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
class CatalogException extends common_1.HttpException {
    constructor(status, errorCode, message, details) {
        super({
            errorCode,
            message: message || errorCode,
            details,
        }, status);
    }
    static badRequest(errorCode, message, details) {
        return new CatalogException(common_1.HttpStatus.BAD_REQUEST, errorCode, message, details);
    }
    static unauthorized(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.UNAUTHORIZED, errorCode, message);
    }
    static forbidden(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.FORBIDDEN, errorCode, message);
    }
    static notFound(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.NOT_FOUND, errorCode, message);
    }
    static conflict(errorCode, message, details) {
        return new CatalogException(common_1.HttpStatus.CONFLICT, errorCode, message, details);
    }
    static gone(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.GONE, errorCode, message);
    }
    static tooManyRequests(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.TOO_MANY_REQUESTS, errorCode, message);
    }
    static internal(errorCode, message) {
        return new CatalogException(common_1.HttpStatus.INTERNAL_SERVER_ERROR, errorCode, message);
    }
}
exports.CatalogException = CatalogException;
//# sourceMappingURL=catalog-exception.js.map