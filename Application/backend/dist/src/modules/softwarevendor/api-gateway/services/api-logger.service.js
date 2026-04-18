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
var ApiLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiLoggerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
const SENSITIVE_FIELDS = ['password', 'secret', 'token', 'apiKey', 'creditCard', 'keyHash', 'keySecret'];
let ApiLoggerService = ApiLoggerService_1 = class ApiLoggerService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ApiLoggerService_1.name);
    }
    async log(params) {
        try {
            const sanitizedBody = params.requestBody ? this.sanitize(params.requestBody) : null;
            const truncatedResponse = params.responseBody
                ? this.truncate(params.responseBody, 10240)
                : null;
            let level = 'API_INFO';
            if (params.statusCode >= 500)
                level = 'API_ERROR';
            else if (params.statusCode >= 400)
                level = 'API_WARN';
            await this.prisma.working.apiRequestLog.create({
                data: {
                    tenantId: params.tenantId,
                    apiKeyId: params.apiKeyId,
                    apiKeyName: params.apiKeyName,
                    method: params.method,
                    path: params.path,
                    queryParams: params.queryParams || undefined,
                    requestBody: sanitizedBody,
                    statusCode: params.statusCode,
                    responseBody: truncatedResponse,
                    responseTimeMs: params.responseTimeMs,
                    ip: params.ip,
                    userAgent: params.userAgent,
                    requestId: params.requestId,
                    rateLimitRemaining: params.rateLimitRemaining,
                    rateLimitUsed: params.rateLimitUsed,
                    wasRateLimited: params.wasRateLimited || false,
                    errorCode: params.errorCode,
                    errorMessage: params.errorMessage,
                    level,
                },
            });
        }
        catch (err) {
            this.logger.error(`Failed to log API request: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
    async listLogs(tenantId, query) {
        const where = { tenantId };
        if (query.apiKeyId)
            where.apiKeyId = query.apiKeyId;
        if (query.path)
            where.path = { contains: query.path };
        if (query.statusCode)
            where.statusCode = query.statusCode;
        if (query.fromDate || query.toDate) {
            where.createdAt = {};
            if (query.fromDate)
                where.createdAt.gte = new Date(query.fromDate);
            if (query.toDate)
                where.createdAt.lte = new Date(query.toDate);
        }
        const page = query.page || 1;
        const limit = query.limit || 50;
        const [data, total] = await Promise.all([
            this.prisma.working.apiRequestLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.apiRequestLog.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }
    async cleanup(retentionDays) {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - retentionDays);
        const result = await this.prisma.working.apiRequestLog.deleteMany({
            where: { createdAt: { lt: cutoff } },
        });
        this.logger.log(`Cleaned up ${result.count} API request logs older than ${retentionDays} days`);
        return result.count;
    }
    sanitize(obj) {
        if (typeof obj !== 'object' || obj === null)
            return obj;
        const result = Array.isArray(obj) ? [...obj] : { ...obj };
        for (const key of Object.keys(result)) {
            if (SENSITIVE_FIELDS.some(f => key.toLowerCase().includes(f.toLowerCase()))) {
                result[key] = '***REDACTED***';
            }
            else if (typeof result[key] === 'object') {
                result[key] = this.sanitize(result[key]);
            }
        }
        return result;
    }
    truncate(obj, maxBytes) {
        const str = JSON.stringify(obj);
        if (str.length <= maxBytes)
            return obj;
        return { _truncated: true, _size: str.length, _preview: str.substring(0, 500) };
    }
};
exports.ApiLoggerService = ApiLoggerService;
exports.ApiLoggerService = ApiLoggerService = ApiLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApiLoggerService);
//# sourceMappingURL=api-logger.service.js.map