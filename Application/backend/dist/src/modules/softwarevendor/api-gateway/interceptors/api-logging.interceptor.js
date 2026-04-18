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
var ApiLoggingInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const crypto_1 = require("crypto");
const api_logger_service_1 = require("../services/api-logger.service");
let ApiLoggingInterceptor = ApiLoggingInterceptor_1 = class ApiLoggingInterceptor {
    constructor(apiLogger) {
        this.apiLogger = apiLogger;
        this.logger = new common_1.Logger(ApiLoggingInterceptor_1.name);
    }
    intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();
        if (!request.apiKey)
            return next.handle();
        const requestId = (0, crypto_1.randomUUID)();
        request.requestId = requestId;
        const start = Date.now();
        return next.handle().pipe((0, operators_1.tap)((responseBody) => {
            const elapsed = Date.now() - start;
            this.apiLogger.log({
                tenantId: request.tenantId,
                apiKeyId: request.apiKeyId,
                apiKeyName: request.apiKeyName || 'unknown',
                method: request.method,
                path: request.url,
                queryParams: request.query,
                requestBody: request.body,
                statusCode: response.statusCode,
                responseBody,
                responseTimeMs: elapsed,
                ip: request.ip || '0.0.0.0',
                userAgent: request.headers['user-agent'],
                requestId,
                rateLimitRemaining: request.rateLimitInfo?.remaining,
                rateLimitUsed: request.rateLimitInfo?.usage?.minute?.used,
                wasRateLimited: false,
            }).catch(err => this.logger.error(`Log failed: ${err.message}`));
        }), (0, operators_1.catchError)((error) => {
            const elapsed = Date.now() - start;
            this.apiLogger.log({
                tenantId: request.tenantId,
                apiKeyId: request.apiKeyId,
                apiKeyName: request.apiKeyName || 'unknown',
                method: request.method,
                path: request.url,
                queryParams: request.query,
                requestBody: request.body,
                statusCode: error.status || 500,
                responseTimeMs: elapsed,
                ip: request.ip || '0.0.0.0',
                userAgent: request.headers['user-agent'],
                requestId,
                rateLimitRemaining: request.rateLimitInfo?.remaining,
                rateLimitUsed: request.rateLimitInfo?.usage?.minute?.used,
                wasRateLimited: error.status === 429,
                errorCode: error.code || error.errorCode,
                errorMessage: error.message,
            }).catch(err => this.logger.error(`Log failed: ${err.message}`));
            throw error;
        }));
    }
};
exports.ApiLoggingInterceptor = ApiLoggingInterceptor;
exports.ApiLoggingInterceptor = ApiLoggingInterceptor = ApiLoggingInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [api_logger_service_1.ApiLoggerService])
], ApiLoggingInterceptor);
//# sourceMappingURL=api-logging.interceptor.js.map