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
var BrandErrorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandErrorController = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const escalation_service_1 = require("./escalation.service");
const error_center_errors_1 = require("./error-center.errors");
let BrandErrorController = BrandErrorController_1 = class BrandErrorController {
    constructor(db, escalationService) {
        this.db = db;
        this.escalationService = escalationService;
        this.logger = new common_1.Logger(BrandErrorController_1.name);
    }
    async getBrandErrors(brandId, page, limit, status) {
        try {
            const take = Math.min(parseInt(limit ?? '20'), 100);
            const skip = (parseInt(page ?? '1') - 1) * take;
            const where = { brandId };
            if (status)
                where.status = status;
            const [items, total] = await Promise.all([
                this.db.customerErrorReport.findMany({
                    where,
                    orderBy: { createdAt: 'desc' },
                    skip,
                    take,
                    select: {
                        id: true,
                        reportedBy: true,
                        title: true,
                        errorCode: true,
                        status: true,
                        createdAt: true,
                        resolvedAt: true,
                        escalatedAt: true,
                    },
                }),
                this.db.customerErrorReport.count({ where }),
            ]);
            return { items, total, page: parseInt(page ?? '1'), limit: take };
        }
        catch (error) {
            this.logger.error(`BrandErrorController.getBrandErrors failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getBrandStats(brandId) {
        try {
            const [total, byStatus, recent] = await Promise.all([
                this.db.customerErrorReport.count({ where: { brandId } }),
                this.db.customerErrorReport.groupBy({
                    by: ['status'],
                    _count: { id: true },
                    where: { brandId },
                }),
                this.db.customerErrorReport.findMany({
                    where: { brandId, status: { not: 'RESOLVED' } },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: { id: true, title: true, status: true, createdAt: true },
                }),
            ]);
            return { total, byStatus, recent };
        }
        catch (error) {
            this.logger.error(`BrandErrorController.getBrandStats failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getBrandError(brandId, id) {
        try {
            const report = await this.db.customerErrorReport.findFirst({
                where: { id, brandId },
                select: {
                    id: true,
                    reportedBy: true,
                    title: true,
                    description: true,
                    errorCode: true,
                    screenshots: true,
                    browserInfo: true,
                    lastActions: true,
                    status: true,
                    escalatedAt: true,
                    resolvedAt: true,
                    createdAt: true,
                },
            });
            if (!report) {
                throw new common_1.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            return report;
        }
        catch (error) {
            this.logger.error(`BrandErrorController.getBrandError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async acknowledgeError(brandId, id) {
        try {
            const report = await this.db.customerErrorReport.findFirst({
                where: { id, brandId },
            });
            if (!report) {
                throw new common_1.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            return await this.db.customerErrorReport.update({
                where: { id },
                data: { status: 'ACKNOWLEDGED' },
            });
        }
        catch (error) {
            this.logger.error(`BrandErrorController.acknowledgeError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async escalateToDeveloper(brandId, id, brandNotes) {
        try {
            await this.escalationService.escalateToDeveloper(id, brandNotes ?? '');
            return { success: true };
        }
        catch (error) {
            this.logger.error(`BrandErrorController.escalateToDeveloper failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolveError(brandId, id, body) {
        try {
            await this.escalationService.resolveError(id, body.resolution, body.resolvedBy);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`BrandErrorController.resolveError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.BrandErrorController = BrandErrorController;
__decorate([
    (0, common_1.Get)(':brandId'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "getBrandErrors", null);
__decorate([
    (0, common_1.Get)(':brandId/stats'),
    __param(0, (0, common_1.Param)('brandId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "getBrandStats", null);
__decorate([
    (0, common_1.Get)(':brandId/:id'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "getBrandError", null);
__decorate([
    (0, common_1.Patch)(':brandId/:id/ack'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "acknowledgeError", null);
__decorate([
    (0, common_1.Post)(':brandId/:id/escalate'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('brandNotes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "escalateToDeveloper", null);
__decorate([
    (0, common_1.Post)(':brandId/:id/resolve'),
    __param(0, (0, common_1.Param)('brandId')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], BrandErrorController.prototype, "resolveError", null);
exports.BrandErrorController = BrandErrorController = BrandErrorController_1 = __decorate([
    (0, common_1.Controller)('errors/brand'),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        escalation_service_1.EscalationService])
], BrandErrorController);
//# sourceMappingURL=brand-error.controller.js.map