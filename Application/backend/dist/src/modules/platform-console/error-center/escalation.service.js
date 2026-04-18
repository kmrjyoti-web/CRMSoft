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
var EscalationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscalationService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const error_center_errors_1 = require("./error-center.errors");
let EscalationService = EscalationService_1 = class EscalationService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(EscalationService_1.name);
    }
    async submitCustomerReport(dto) {
        try {
            const report = await this.db.customerErrorReport.create({
                data: {
                    brandId: dto.brandId,
                    tenantId: dto.tenantId,
                    reportedBy: dto.reportedBy,
                    title: dto.title,
                    description: dto.description,
                    errorCode: dto.errorCode,
                    screenshots: dto.screenshots ?? [],
                    browserInfo: (dto.browserInfo ?? {}),
                    lastActions: dto.lastActions ?? [],
                    status: 'OPEN',
                },
            });
            const isCritical = dto.errorCode?.startsWith('E_DB') ||
                dto.errorCode?.startsWith('E_CRITICAL');
            if (isCritical) {
                await this.autoEscalate(report.id, 'CRITICAL error code detected');
            }
            this.logger.log(`Customer error report ${report.id} submitted by ${dto.reportedBy}`);
            return report;
        }
        catch (error) {
            this.logger.error(`EscalationService.submitCustomerReport failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async escalateToBrand(reportId) {
        try {
            const report = await this.db.customerErrorReport.findUnique({
                where: { id: reportId },
            });
            if (!report) {
                throw new common_1.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            if (report.status === 'RESOLVED') {
                throw new common_1.ConflictException(error_center_errors_1.ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
            }
            await this.db.customerErrorReport.update({
                where: { id: reportId },
                data: { status: 'ACKNOWLEDGED', escalatedAt: new Date() },
            });
            this.logger.log(`Report ${reportId} escalated to brand (Level 2)`);
        }
        catch (error) {
            this.logger.error(`EscalationService.escalateToBrand failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async escalateToDeveloper(reportId, brandNotes) {
        try {
            const report = await this.db.customerErrorReport.findUnique({
                where: { id: reportId },
            });
            if (!report) {
                throw new common_1.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            if (report.status === 'RESOLVED') {
                throw new common_1.ConflictException(error_center_errors_1.ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
            }
            let errorLogId;
            if (report.errorCode) {
                const log = await this.db.globalErrorLog.findFirst({
                    where: { errorCode: report.errorCode, resolvedAt: null },
                    orderBy: { createdAt: 'desc' },
                });
                errorLogId = log?.id;
            }
            const existing = await this.db.errorEscalation.findFirst({
                where: errorLogId ? { errorLogId } : undefined,
            });
            if (!existing && errorLogId) {
                await this.db.errorEscalation.create({
                    data: {
                        errorLogId,
                        level: 3,
                        brandNotes,
                        escalatedAt: new Date(),
                    },
                });
            }
            else if (existing) {
                await this.db.errorEscalation.update({
                    where: { id: existing.id },
                    data: { level: 3, brandNotes, escalatedAt: new Date() },
                });
            }
            await this.db.customerErrorReport.update({
                where: { id: reportId },
                data: { status: 'ESCALATED' },
            });
            this.logger.log(`Report ${reportId} escalated to developer (Level 3)`);
        }
        catch (error) {
            this.logger.error(`EscalationService.escalateToDeveloper failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async resolveError(reportId, resolution, resolvedBy) {
        try {
            const report = await this.db.customerErrorReport.findUnique({
                where: { id: reportId },
            });
            if (!report) {
                throw new common_1.NotFoundException(error_center_errors_1.ERROR_CENTER_ERRORS.REPORT_NOT_FOUND.message);
            }
            if (report.status === 'RESOLVED') {
                throw new common_1.ConflictException(error_center_errors_1.ERROR_CENTER_ERRORS.ALREADY_RESOLVED.message);
            }
            await this.db.customerErrorReport.update({
                where: { id: reportId },
                data: { status: 'RESOLVED', resolvedAt: new Date() },
            });
            if (report.errorCode) {
                await this.db.globalErrorLog.updateMany({
                    where: { errorCode: report.errorCode, resolvedAt: null },
                    data: { resolvedAt: new Date(), resolvedBy, resolution },
                });
            }
            this.logger.log(`Report ${reportId} resolved by ${resolvedBy}: ${resolution}`);
        }
        catch (error) {
            this.logger.error(`EscalationService.resolveError failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async autoEscalate(reportId, reason) {
        try {
            await this.db.customerErrorReport.update({
                where: { id: reportId },
                data: { status: 'ESCALATED', escalatedAt: new Date() },
            });
            await this.db.errorAutoReport.create({
                data: {
                    ruleCode: 'AUTO_CRITICAL',
                    severity: 'CRITICAL',
                    condition: reason,
                    errorCode: 'AUTO',
                    occurrences: 1,
                    notifyChannel: 'EMAIL',
                    acknowledged: false,
                },
            });
            this.logger.warn(`Auto-escalated report ${reportId}: ${reason}`);
        }
        catch (error) {
            this.logger.error(`EscalationService.autoEscalate failed: ${error.message}`, error.stack);
        }
    }
    async checkThresholdRules() {
        try {
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const grouped = await this.db.globalErrorLog.groupBy({
                by: ['errorCode'],
                _count: { id: true },
                where: { createdAt: { gte: oneHourAgo } },
                having: { id: { _count: { gte: 3 } } },
            });
            for (const row of grouped) {
                const existing = await this.db.errorAutoReport.findFirst({
                    where: {
                        errorCode: row.errorCode,
                        ruleCode: 'THRESHOLD_3X_1H',
                        notifiedAt: { gte: oneHourAgo },
                    },
                });
                if (!existing) {
                    await this.db.errorAutoReport.create({
                        data: {
                            ruleCode: 'THRESHOLD_3X_1H',
                            severity: 'HIGH',
                            condition: `Same error code ${row.errorCode} appeared ${row._count.id} times in 1 hour`,
                            errorCode: row.errorCode,
                            occurrences: row._count.id,
                            notifyChannel: 'EMAIL',
                            acknowledged: false,
                        },
                    });
                    this.logger.warn(`Auto-report: ${row.errorCode} occurred ${row._count.id}x in 1h`);
                }
            }
        }
        catch (error) {
            this.logger.error(`EscalationService.checkThresholdRules failed: ${error.message}`, error.stack);
        }
    }
};
exports.EscalationService = EscalationService;
exports.EscalationService = EscalationService = EscalationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], EscalationService);
//# sourceMappingURL=escalation.service.js.map