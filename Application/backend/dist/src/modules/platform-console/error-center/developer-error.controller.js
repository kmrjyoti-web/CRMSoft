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
var DeveloperErrorController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperErrorController = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const escalation_service_1 = require("./escalation.service");
let DeveloperErrorController = DeveloperErrorController_1 = class DeveloperErrorController {
    constructor(db, escalationService) {
        this.db = db;
        this.escalationService = escalationService;
        this.logger = new common_1.Logger(DeveloperErrorController_1.name);
    }
    async getEscalated(page, limit) {
        try {
            const take = Math.min(parseInt(limit ?? '20'), 100);
            const skip = (parseInt(page ?? '1') - 1) * take;
            const [items, total] = await Promise.all([
                this.db.customerErrorReport.findMany({
                    where: { status: 'ESCALATED' },
                    orderBy: { escalatedAt: 'desc' },
                    skip,
                    take,
                }),
                this.db.customerErrorReport.count({ where: { status: 'ESCALATED' } }),
            ]);
            return { items, total, page: parseInt(page ?? '1'), limit: take };
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.getEscalated failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getAutoReports(page, limit, acknowledged) {
        try {
            const take = Math.min(parseInt(limit ?? '20'), 100);
            const skip = (parseInt(page ?? '1') - 1) * take;
            const where = {};
            if (acknowledged !== undefined) {
                where.acknowledged = acknowledged === 'true';
            }
            const [items, total] = await Promise.all([
                this.db.errorAutoReport.findMany({
                    where,
                    orderBy: { notifiedAt: 'desc' },
                    skip,
                    take,
                }),
                this.db.errorAutoReport.count({ where }),
            ]);
            return { items, total, page: parseInt(page ?? '1'), limit: take };
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.getAutoReports failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getByBrand() {
        try {
            return await this.db.customerErrorReport.groupBy({
                by: ['brandId'],
                _count: { id: true },
                orderBy: { _count: { id: 'desc' } },
                take: 20,
            });
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.getByBrand failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getByVertical() {
        try {
            return await this.db.globalErrorLog.groupBy({
                by: ['verticalType'],
                _count: { id: true },
                where: { verticalType: { not: null } },
                orderBy: { _count: { id: 'desc' } },
            });
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.getByVertical failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolveError(id, body) {
        try {
            await this.escalationService.resolveError(id, body.resolution, body.resolvedBy);
            return { success: true };
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.resolveError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async addDeveloperNotes(id, notes) {
        try {
            const escalation = await this.db.errorEscalation.findFirst({
                where: { errorLogId: id },
            });
            if (escalation) {
                return await this.db.errorEscalation.update({
                    where: { id: escalation.id },
                    data: { developerNotes: notes },
                });
            }
            return await this.db.errorEscalation.create({
                data: {
                    errorLogId: id,
                    level: 3,
                    developerNotes: notes,
                },
            });
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.addDeveloperNotes failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async assignError(id, body) {
        try {
            return await this.db.globalErrorLog.update({
                where: { id },
                data: {
                    resolution: body.gitIssue
                        ? `Assigned to ${body.gitIssue}`
                        : body.assignedTo,
                },
            });
        }
        catch (error) {
            this.logger.error(`DeveloperErrorController.assignError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DeveloperErrorController = DeveloperErrorController;
__decorate([
    (0, common_1.Get)('escalated'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "getEscalated", null);
__decorate([
    (0, common_1.Get)('auto-reports'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('acknowledged')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "getAutoReports", null);
__decorate([
    (0, common_1.Get)('by-brand'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "getByBrand", null);
__decorate([
    (0, common_1.Get)('by-vertical'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "getByVertical", null);
__decorate([
    (0, common_1.Patch)(':id/resolve'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "resolveError", null);
__decorate([
    (0, common_1.Post)(':id/notes'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('notes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "addDeveloperNotes", null);
__decorate([
    (0, common_1.Patch)(':id/assign'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DeveloperErrorController.prototype, "assignError", null);
exports.DeveloperErrorController = DeveloperErrorController = DeveloperErrorController_1 = __decorate([
    (0, common_1.Controller)('platform-console/errors'),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        escalation_service_1.EscalationService])
], DeveloperErrorController);
//# sourceMappingURL=developer-error.controller.js.map