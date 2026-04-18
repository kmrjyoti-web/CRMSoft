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
var CronAlertService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronAlertService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const error_utils_1 = require("../../../../common/utils/error.utils");
let CronAlertService = CronAlertService_1 = class CronAlertService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(CronAlertService_1.name);
    }
    async sendAlert(job, error, runLog) {
        const channel = job.alertChannel;
        const subject = `CRON Job Failed: ${job.jobName}`;
        const body = this.buildAlertBody(job, error, runLog);
        if (channel === 'EMAIL' || channel === 'BOTH') {
            await this.sendEmailAlert(job, subject, body);
        }
        if (channel === 'IN_APP' || channel === 'BOTH') {
            await this.sendInAppAlert(job, subject, body);
        }
    }
    buildAlertBody(job, error, runLog) {
        return [
            `Job: ${job.jobName} (${job.jobCode})`,
            `Module: ${job.moduleName}`,
            `Error: ${error}`,
            `Failed at: ${runLog.startedAt.toISOString()}`,
            `Consecutive failures: ${job.consecutiveFailures}`,
            `Last success: ${job.lastRunAt?.toISOString() ?? 'Never'}`,
            `Triggered by: ${runLog.triggeredBy}`,
        ].join('\n');
    }
    async sendEmailAlert(job, subject, body) {
        if (!job.alertRecipientEmails?.length)
            return;
        this.logger.warn(`[EMAIL ALERT] ${subject}\nTo: ${job.alertRecipientEmails.join(', ')}\n${body}`);
    }
    async sendInAppAlert(job, subject, body) {
        if (!job.alertRecipientUserIds?.length)
            return;
        try {
            await this.prisma.working.notification.createMany({
                data: job.alertRecipientUserIds.map((userId) => ({
                    recipientId: userId,
                    tenantId: '',
                    category: 'SYSTEM',
                    channel: 'IN_APP',
                    title: subject,
                    message: body,
                    priority: 'HIGH',
                    status: 'UNREAD',
                })),
            });
        }
        catch (err) {
            this.logger.error(`Failed to create in-app alert: ${(0, error_utils_1.getErrorMessage)(err)}`);
        }
    }
};
exports.CronAlertService = CronAlertService;
exports.CronAlertService = CronAlertService = CronAlertService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CronAlertService);
//# sourceMappingURL=cron-alert.service.js.map