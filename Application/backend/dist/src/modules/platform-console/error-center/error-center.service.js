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
var ErrorCenterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCenterService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
let ErrorCenterService = ErrorCenterService_1 = class ErrorCenterService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(ErrorCenterService_1.name);
    }
    async listErrors(params) {
        try {
            const page = params.page ?? 1;
            const limit = Math.min(params.limit ?? 20, 100);
            const skip = (page - 1) * limit;
            const where = {};
            if (params.severity)
                where.severity = params.severity;
            if (params.brandId)
                where.brandId = params.brandId;
            if (params.verticalType)
                where.verticalType = params.verticalType;
            if (params.resolved !== undefined) {
                where.resolvedAt = params.resolved ? { not: null } : null;
            }
            const [items, total] = await Promise.all([
                this.db.globalErrorLog.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take: limit,
                    select: {
                        id: true,
                        severity: true,
                        errorCode: true,
                        message: true,
                        module: true,
                        endpoint: true,
                        httpStatus: true,
                        brandId: true,
                        verticalType: true,
                        resolvedAt: true,
                        createdAt: true,
                    },
                }),
                this.db.globalErrorLog.count({ where }),
            ]);
            return {
                items,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        catch (error) {
            this.logger.error(`ErrorCenterService.listErrors failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getError(id) {
        try {
            const error = await this.db.globalErrorLog.findUnique({
                where: { id },
                include: { escalation: true },
            });
            if (!error)
                throw new common_1.NotFoundException(`Error log ${id} not found`);
            return error;
        }
        catch (error) {
            this.logger.error(`ErrorCenterService.getError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStats() {
        try {
            const [bySeverity, byBrand, byVertical, resolvedRate] = await Promise.all([
                this.db.globalErrorLog.groupBy({
                    by: ['severity'],
                    _count: { id: true },
                }),
                this.db.globalErrorLog.groupBy({
                    by: ['brandId'],
                    _count: { id: true },
                    where: { brandId: { not: null } },
                    orderBy: { _count: { id: 'desc' } },
                    take: 10,
                }),
                this.db.globalErrorLog.groupBy({
                    by: ['verticalType'],
                    _count: { id: true },
                    where: { verticalType: { not: null } },
                }),
                this.db.globalErrorLog.count({ where: { resolvedAt: { not: null } } }),
            ]);
            const total = await this.db.globalErrorLog.count();
            return {
                total,
                resolvedRate: total > 0 ? Math.round((resolvedRate / total) * 100) : 0,
                bySeverity,
                byBrand,
                byVertical,
            };
        }
        catch (error) {
            this.logger.error(`ErrorCenterService.getStats failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTrends(period = 'DAILY') {
        try {
            const trends = await this.db.errorTrend.findMany({
                where: { period },
                orderBy: { periodDate: 'desc' },
                take: 30,
            });
            return trends;
        }
        catch (error) {
            this.logger.error(`ErrorCenterService.getTrends failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ErrorCenterService = ErrorCenterService;
exports.ErrorCenterService = ErrorCenterService = ErrorCenterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], ErrorCenterService);
//# sourceMappingURL=error-center.service.js.map