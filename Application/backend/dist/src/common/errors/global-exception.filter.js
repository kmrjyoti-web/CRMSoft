"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const working_client_1 = require("@prisma/working-client");
const identity_client_1 = require("@prisma/identity-client");
const platform_client_1 = require("@prisma/platform-client");
const crypto_1 = require("crypto");
const app_error_1 = require("./app-error");
const error_codes_1 = require("./error-codes");
const error_logger_service_1 = require("./error-logger.service");
const error_catalog_service_1 = require("./error-catalog.service");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    constructor(errorLogger, errorCatalog) {
        this.errorLogger = errorLogger;
        this.errorCatalog = errorCatalog;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const traceId = request.requestId || (0, crypto_1.randomUUID)();
        request.requestId = traceId;
        let statusCode;
        let errorCode;
        let message;
        let suggestion;
        let details = null;
        let layer = 'BE';
        let severity = 'ERROR';
        if (exception instanceof app_error_1.AppError) {
            statusCode = exception.httpStatus;
            errorCode = exception.code;
            message = exception.message;
            suggestion = exception.suggestion;
            details = exception.details;
        }
        else if (exception instanceof common_1.BadRequestException) {
            const exceptionResponse = exception.getResponse();
            statusCode = 400;
            errorCode = 'VALIDATION_ERROR';
            message = 'One or more fields have invalid values';
            suggestion =
                'Check the details array for field-level errors and fix each one.';
            severity = 'WARNING';
            if (exceptionResponse.message &&
                Array.isArray(exceptionResponse.message)) {
                details = exceptionResponse.message.map((msg) => {
                    if (typeof msg === 'string') {
                        return { field: 'unknown', message: msg };
                    }
                    return msg;
                });
            }
            else if (typeof exceptionResponse.message === 'string') {
                details = [{ field: 'unknown', message: exceptionResponse.message }];
            }
        }
        else if (exception instanceof common_1.HttpException) {
            statusCode = exception.getStatus();
            errorCode = this.mapHttpStatusToCode(statusCode);
            message = exception.message;
            suggestion =
                error_codes_1.ERROR_CODES[errorCode]?.suggestion || 'Check the request and try again.';
            severity = statusCode >= 500 ? 'ERROR' : 'WARNING';
        }
        else if (exception instanceof working_client_1.Prisma.PrismaClientKnownRequestError ||
            exception instanceof identity_client_1.Prisma.PrismaClientKnownRequestError ||
            exception instanceof platform_client_1.Prisma.PrismaClientKnownRequestError) {
            const prismaResult = this.handlePrismaError(exception);
            statusCode = prismaResult.statusCode;
            errorCode = prismaResult.errorCode;
            message = prismaResult.message;
            suggestion = prismaResult.suggestion;
            layer = 'DB';
        }
        else {
            statusCode = 500;
            errorCode = 'INTERNAL_ERROR';
            message = 'An unexpected error occurred';
            suggestion = 'Contact support with the traceId.';
            severity = 'CRITICAL';
        }
        let messageHi;
        let suggestionHi;
        let helpUrl;
        let isRetryable = false;
        let retryAfterMs;
        const catalogEntry = this.getCatalogEntry(errorCode);
        if (catalogEntry) {
            if (!(exception instanceof app_error_1.AppError)) {
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
            layer = catalogEntry.layer;
            severity = catalogEntry.severity;
        }
        const acceptLang = request.headers?.['accept-language'] || '';
        const preferHindi = acceptLang.includes('hi');
        const errorResponse = {
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
            requestHeaders: error_logger_service_1.ErrorLoggerService.sanitizeHeaders(request.headers),
            responseBody: errorResponse,
            responseTimeMs: request['_startTime'] ? Date.now() - request['_startTime'] : undefined,
            userName: request.user?.name,
            userRole: request.user?.role || request.user?.roleName,
            tenantName: request.user?.tenantName,
        });
        response.status(statusCode).json(errorResponse);
    }
    getCatalogEntry(code) {
        if (!this.errorCatalog)
            return null;
        return this.errorCatalog.cache?.get(code) ?? null;
    }
    mapHttpStatusToCode(status) {
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
    extractModuleFromPath(path) {
        const match = path?.match(/\/api\/v\d+\/([^\/]+)/);
        return match ? match[1] : 'unknown';
    }
    handlePrismaError(error) {
        switch (error.code) {
            case 'P2002': {
                const fields = error.meta?.target?.join(', ') || 'unknown field';
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
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [error_logger_service_1.ErrorLoggerService,
        error_catalog_service_1.ErrorCatalogService])
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map