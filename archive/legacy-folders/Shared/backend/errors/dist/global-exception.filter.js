"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const app_error_1 = require("./app-error");
const error_codes_1 = require("./error-codes");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const traceId = request.requestId || (0, crypto_1.randomUUID)();
        let statusCode;
        let errorCode;
        let message;
        let suggestion;
        let details = null;
        if (exception instanceof app_error_1.AppError) {
            statusCode = exception.httpStatus;
            errorCode = exception.code;
            message = exception.message;
            suggestion = exception.suggestion;
            details = exception.details;
        }
        else if (exception instanceof common_1.BadRequestException) {
            const res = exception.getResponse();
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
            message = 'One or more fields have invalid values';
            suggestion = 'Check the details array for field-level errors and fix each one.';
            if (res.message && Array.isArray(res.message)) {
                details = res.message.map((msg) => typeof msg === 'string' ? { field: 'unknown', message: msg } : msg);
            }
        }
        else if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            errorCode = mapHttpStatus(statusCode);
            message = exception.message;
            suggestion = error_codes_1.ERROR_CODES[errorCode]?.suggestion || 'Check the request and try again.';
        }
        else {
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
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
function mapHttpStatus(status) {
    const map = {
        400: 'INVALID_INPUT', 401: 'AUTH_TOKEN_INVALID', 403: 'FORBIDDEN',
        404: 'NOT_FOUND', 409: 'DUPLICATE_ENTRY', 422: 'INVALID_STATE',
        429: 'RATE_LIMIT_EXCEEDED', 503: 'SERVICE_UNAVAILABLE',
    };
    return map[status] || 'INTERNAL_ERROR';
}
//# sourceMappingURL=global-exception.filter.js.map