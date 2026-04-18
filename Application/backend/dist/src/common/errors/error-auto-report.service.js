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
exports.ErrorAutoReportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../core/prisma/prisma.service");
const error_utils_1 = require("../utils/error.utils");
let ErrorAutoReportService = class ErrorAutoReportService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger('ErrorAutoReport');
    }
    async checkAndReport(errorLog) {
        try {
            const rules = await this.prisma.platform.errorAutoReportRule.findMany({
                where: {
                    severity: errorLog.severity,
                    isActive: true,
                    OR: [
                        { tenantId: null },
                        { tenantId: errorLog.tenantId },
                    ],
                },
            });
            for (const rule of rules) {
                if (rule.lastTriggeredAt) {
                    const minutesSince = (Date.now() - rule.lastTriggeredAt.getTime()) / 60000;
                    if (minutesSince < rule.throttleMinutes)
                        continue;
                }
                this.logger.log(`Auto-report triggered: rule="${rule.name}" severity=${errorLog.severity} channels=${rule.channels.join(',')}`);
                await this.prisma.platform.errorLog.update({
                    where: { id: errorLog.id },
                    data: {
                        isAutoReported: true,
                        autoReportedAt: new Date(),
                        autoReportedTo: rule.channels,
                    },
                });
                await this.prisma.platform.errorAutoReportRule.update({
                    where: { id: rule.id },
                    data: { lastTriggeredAt: new Date() },
                });
            }
        }
        catch (err) {
            this.logger.error(`Auto-report check failed: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
    async listRules(tenantId) {
        const where = {};
        if (tenantId) {
            where.OR = [{ tenantId: null }, { tenantId }];
        }
        return this.prisma.platform.errorAutoReportRule.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }
    async createRule(data) {
        return this.prisma.platform.errorAutoReportRule.create({
            data: {
                name: data.name,
                severity: data.severity,
                channels: data.channels,
                tenantId: data.tenantId,
                emailRecipients: data.emailRecipients || [],
                slackWebhookUrl: data.slackWebhookUrl,
                whatsappNumbers: data.whatsappNumbers || [],
                throttleMinutes: data.throttleMinutes ?? 15,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateRule(id, data) {
        const updateData = { ...data };
        if (data.severity)
            updateData.severity = data.severity;
        return this.prisma.platform.errorAutoReportRule.update({
            where: { id },
            data: updateData,
        });
    }
    async deleteRule(id) {
        return this.prisma.platform.errorAutoReportRule.delete({ where: { id } });
    }
    async reportToProvider(errorLogId, reportedById) {
        const errorLog = await this.prisma.platform.errorLog.findUnique({
            where: { id: errorLogId },
        });
        if (!errorLog) {
            return { reported: false };
        }
        await this.prisma.platform.errorLog.update({
            where: { id: errorLogId },
            data: {
                reportedToProvider: true,
                reportedToProviderAt: new Date(),
                reportedToProviderById: reportedById,
            },
        });
        try {
            const criticalRules = await this.prisma.platform.errorAutoReportRule.findMany({
                where: { severity: 'CRITICAL', isActive: true },
            });
            for (const rule of criticalRules) {
                this.logger.log(`Manual provider report triggered: rule="${rule.name}" channels=${rule.channels.join(',')} for errorLogId=${errorLogId}`);
                await this.prisma.platform.errorAutoReportRule.update({
                    where: { id: rule.id },
                    data: { lastTriggeredAt: new Date() },
                });
            }
        }
        catch (err) {
            this.logger.error(`Failed to fire provider report channels: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
        return { reported: true };
    }
};
exports.ErrorAutoReportService = ErrorAutoReportService;
exports.ErrorAutoReportService = ErrorAutoReportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ErrorAutoReportService);
//# sourceMappingURL=error-auto-report.service.js.map