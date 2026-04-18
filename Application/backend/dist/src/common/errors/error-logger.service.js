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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ErrorLoggerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLoggerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const error_utils_1 = require("../utils/error.utils");
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'apiKey', 'accessToken', 'refreshToken'];
const ALWAYS_PERSIST_CODES = ['AUTH_TOKEN_INVALID', 'AUTH_TOKEN_EXPIRED', 'UNAUTHORIZED', 'FORBIDDEN', 'RATE_LIMIT_EXCEEDED'];
let ErrorLoggerService = ErrorLoggerService_1 = class ErrorLoggerService {
    constructor(prisma, autoReportService) {
        this.prisma = prisma;
        this.autoReportService = autoReportService;
        this.logger = new common_1.Logger('ErrorLogger');
    }
    log(entry) {
        const tag = `[${entry.requestId}] ${entry.errorCode} ${entry.method} ${entry.path}`;
        if (entry.statusCode >= 500) {
            this.logger.error(`${tag} � ${entry.message}`, entry.stack);
        }
        else {
            this.logger.warn(`${tag} � ${entry.message}`);
        }
        const is4xx = entry.statusCode >= 400 && entry.statusCode < 500;
        if (!is4xx || ALWAYS_PERSIST_CODES.includes(entry.errorCode)) {
            void this.persistAsync(entry);
        }
    }
    async getById(id) {
        return this.prisma.platform.errorLog.findUnique({ where: { id } });
    }
    async getByTraceId(traceId) {
        return this.prisma.platform.errorLog.findMany({
            where: { requestId: traceId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getRecent(options) {
        const page = options.page || 1;
        const limit = options.limit || 20;
        const where = {};
        if (options.errorCode)
            where.errorCode = options.errorCode;
        if (options.tenantId)
            where.tenantId = options.tenantId;
        if (options.layer)
            where.layer = options.layer;
        if (options.severity)
            where.severity = options.severity;
        if (options.status)
            where.status = options.status;
        if (options.dateFrom || options.dateTo) {
            where.createdAt = {};
            if (options.dateFrom)
                where.createdAt.gte = new Date(options.dateFrom);
            if (options.dateTo)
                where.createdAt.lte = new Date(options.dateTo);
        }
        const [data, total] = await Promise.all([
            this.prisma.platform.errorLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.platform.errorLog.count({ where }),
        ]);
        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrevious: page > 1,
            },
        };
    }
    async getStats(options) {
        const where = {};
        if (options?.tenantId)
            where.tenantId = options.tenantId;
        if (options?.since)
            where.createdAt = { gte: new Date(options.since) };
        const [byCodeStats, bySeverityStats, total] = await Promise.all([
            this.prisma.platform.errorLog.groupBy({
                by: ['errorCode'],
                where,
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
            }),
            this.prisma.platform.errorLog.groupBy({
                by: ['severity'],
                where,
                _count: { id: true },
            }),
            this.prisma.platform.errorLog.count({ where }),
        ]);
        const bySeverity = { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 };
        for (const s of bySeverityStats) {
            bySeverity[s.severity] = s._count.id;
        }
        return {
            total,
            byCode: byCodeStats.map((s) => ({
                errorCode: s.errorCode,
                count: s._count.id,
            })),
            bySeverity,
        };
    }
    async getBySeverity(tenantId, severity, limit = 50) {
        return this.prisma.platform.errorLog.findMany({
            where: { tenantId, severity: severity },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async resolve(id, data) {
        return this.prisma.platform.errorLog.update({
            where: { id },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date(),
                resolvedById: data.resolvedById,
                resolution: data.resolution,
            },
        });
    }
    async assign(id, data) {
        return this.prisma.platform.errorLog.update({
            where: { id },
            data: {
                status: 'ASSIGNED',
                assignedToId: data.assignedToId,
                assignedToName: data.assignedToName,
            },
        });
    }
    async ignore(id) {
        return this.prisma.platform.errorLog.update({
            where: { id },
            data: { status: 'IGNORED' },
        });
    }
    async getTrends(options) {
        const days = options?.days || 14;
        const since = new Date();
        since.setDate(since.getDate() - days);
        const where = { createdAt: { gte: since } };
        if (options?.tenantId)
            where.tenantId = options.tenantId;
        const logs = await this.prisma.platform.errorLog.findMany({
            where,
            select: { createdAt: true, severity: true },
            orderBy: { createdAt: 'asc' },
        });
        const trendMap = {};
        for (let d = 0; d < days; d++) {
            const date = new Date(since);
            date.setDate(date.getDate() + d);
            const key = date.toISOString().slice(0, 10);
            trendMap[key] = { total: 0, bySeverity: { INFO: 0, WARNING: 0, ERROR: 0, CRITICAL: 0 } };
        }
        for (const log of logs) {
            const key = log.createdAt.toISOString().slice(0, 10);
            if (trendMap[key]) {
                trendMap[key].total++;
                trendMap[key].bySeverity[log.severity]++;
            }
        }
        return Object.entries(trendMap).map(([date, counts]) => ({
            date,
            ...counts,
        }));
    }
    static sanitizeBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const sanitized = { ...body };
        for (const key of Object.keys(sanitized)) {
            if (SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk.toLowerCase()))) {
                sanitized[key] = '[REDACTED]';
            }
        }
        return sanitized;
    }
    static sanitizeHeaders(headers) {
        if (!headers)
            return {};
        const safe = { ...headers };
        delete safe.authorization;
        delete safe.cookie;
        delete safe['set-cookie'];
        return safe;
    }
    async persistAsync(entry) {
        try {
            const created = await this.prisma.platform.errorLog.create({
                data: {
                    requestId: entry.requestId,
                    errorCode: entry.errorCode,
                    message: entry.message,
                    statusCode: entry.statusCode,
                    layer: entry.layer || 'BE',
                    severity: entry.severity || (entry.statusCode >= 500 ? 'ERROR' : 'WARNING'),
                    path: entry.path,
                    method: entry.method,
                    userId: entry.userId,
                    tenantId: entry.tenantId,
                    details: entry.details ? JSON.parse(JSON.stringify(entry.details)) : undefined,
                    stack: entry.stack?.slice(0, 4000),
                    ip: entry.ip,
                    userAgent: entry.userAgent?.slice(0, 500),
                    module: entry.module,
                    requestBody: entry.requestBody ? ErrorLoggerService_1.sanitizeBody(entry.requestBody) : undefined,
                    queryParams: entry.queryParams,
                    metadata: entry.metadata,
                    requestHeaders: entry.requestHeaders ? ErrorLoggerService_1.sanitizeHeaders(entry.requestHeaders) : undefined,
                    responseBody: entry.responseBody ? JSON.parse(JSON.stringify(entry.responseBody)) : undefined,
                    responseTimeMs: entry.responseTimeMs,
                    userName: entry.userName,
                    userRole: entry.userRole,
                    tenantName: entry.tenantName,
                    industryCode: entry.industryCode,
                },
            });
            if ((entry.severity === 'ERROR' || entry.severity === 'CRITICAL') && this.autoReportService) {
                this.autoReportService.checkAndReport(created);
            }
        }
        catch (err) {
            this.logger.error(`Failed to persist error log: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
};
exports.ErrorLoggerService = ErrorLoggerService;
exports.ErrorLoggerService = ErrorLoggerService = ErrorLoggerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Optional)()),
    __param(1, (0, common_1.Inject)('ErrorAutoReportService')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, Object])
], ErrorLoggerService);
//# sourceMappingURL=error-logger.service.js.map