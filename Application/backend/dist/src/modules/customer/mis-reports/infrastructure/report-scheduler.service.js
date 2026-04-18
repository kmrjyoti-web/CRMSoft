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
var ReportSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const fs = require("fs");
const path = require("path");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const report_engine_service_1 = require("./report-engine.service");
const report_emailer_service_1 = require("./report-emailer.service");
const MAX_CONSECUTIVE_FAILURES = 5;
const BATCH_SIZE = 10;
const EXPORT_RETENTION_DAYS = 30;
let ReportSchedulerService = ReportSchedulerService_1 = class ReportSchedulerService {
    constructor(prisma, engine, emailer) {
        this.prisma = prisma;
        this.engine = engine;
        this.emailer = emailer;
        this.logger = new common_1.Logger(ReportSchedulerService_1.name);
    }
    async processScheduledReports() {
        const now = new Date();
        const dueReports = await this.prisma.working.scheduledReport.findMany({
            where: {
                status: 'ACTIVE',
                nextScheduledAt: { lte: now },
            },
            include: { reportDef: true },
            take: BATCH_SIZE,
            orderBy: { nextScheduledAt: 'asc' },
        });
        if (!dueReports.length)
            return;
        this.logger.log(`Processing ${dueReports.length} scheduled report(s)`);
        for (const schedule of dueReports) {
            await this.processOne(schedule);
        }
    }
    async processOne(schedule) {
        const reportCode = schedule.reportDef?.code;
        if (!reportCode) {
            this.logger.warn(`Schedule ${schedule.id}: missing reportDef code, skipping`);
            return;
        }
        try {
            const dateTo = new Date();
            const dateFrom = this.getDateFrom(schedule.frequency, dateTo);
            const params = { dateFrom, dateTo, filters: schedule.filters || {} };
            const exportResult = await this.engine.export(reportCode, params, schedule.format, schedule.createdById, 'Scheduled', 'SCHEDULED');
            const fileBuffer = require('fs').readFileSync(exportResult.fileUrl);
            await this.emailer.sendReport({
                recipients: schedule.recipientEmails || [],
                reportName: schedule.name,
                format: schedule.format,
                fileBuffer,
                fileName: exportResult.fileName,
            });
            const nextScheduledAt = this.calculateNextScheduledAt(schedule.frequency, schedule.dayOfWeek, schedule.dayOfMonth, schedule.timeOfDay);
            await this.prisma.working.scheduledReport.update({
                where: { id: schedule.id },
                data: {
                    lastSentAt: new Date(),
                    nextScheduledAt,
                    lastError: null,
                    sendCount: { increment: 1 },
                },
            });
            this.logger.log(`Schedule ${schedule.id}: sent "${schedule.name}" successfully`);
        }
        catch (error) {
            const errMsg = error instanceof Error ? error.message : String(error);
            this.logger.error(`Schedule ${schedule.id} failed: ${errMsg}`);
            const updatedSchedule = await this.prisma.working.scheduledReport.update({
                where: { id: schedule.id },
                data: { lastError: errMsg },
            });
            await this.checkAndPauseIfNeeded(updatedSchedule);
        }
    }
    async checkAndPauseIfNeeded(schedule) {
        const recentLogs = await this.prisma.working.reportExportLog.findMany({
            where: { scheduledReportId: schedule.id, status: 'FAILED' },
            orderBy: { createdAt: 'desc' },
            take: MAX_CONSECUTIVE_FAILURES,
        });
        if (recentLogs.length >= MAX_CONSECUTIVE_FAILURES) {
            await this.prisma.working.scheduledReport.update({
                where: { id: schedule.id },
                data: { status: 'PAUSED' },
            });
            this.logger.warn(`Schedule ${schedule.id} paused after ${MAX_CONSECUTIVE_FAILURES} failures`);
        }
    }
    calculateNextScheduledAt(frequency, dayOfWeek, dayOfMonth, timeOfDay) {
        const now = new Date();
        const [hours, minutes] = (timeOfDay || '08:00').split(':').map(Number);
        const next = new Date(now);
        next.setHours(hours, minutes, 0, 0);
        switch (frequency) {
            case 'DAILY':
                next.setDate(next.getDate() + 1);
                break;
            case 'WEEKLY':
                next.setDate(next.getDate() + 1);
                while (next.getDay() !== (dayOfWeek ?? 1)) {
                    next.setDate(next.getDate() + 1);
                }
                break;
            case 'MONTHLY':
                next.setMonth(next.getMonth() + 1);
                next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
                break;
            case 'QUARTERLY':
                next.setMonth(next.getMonth() + 3);
                next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
                break;
            case 'YEARLY':
                next.setFullYear(next.getFullYear() + 1);
                next.setDate(Math.min(dayOfMonth ?? 1, this.daysInMonth(next)));
                break;
            default:
                next.setDate(next.getDate() + 1);
        }
        return next;
    }
    getDateFrom(frequency, dateTo) {
        const from = new Date(dateTo);
        switch (frequency) {
            case 'DAILY':
                from.setDate(from.getDate() - 1);
                break;
            case 'WEEKLY':
                from.setDate(from.getDate() - 7);
                break;
            case 'MONTHLY':
                from.setMonth(from.getMonth() - 1);
                break;
            case 'QUARTERLY':
                from.setMonth(from.getMonth() - 3);
                break;
            case 'YEARLY':
                from.setFullYear(from.getFullYear() - 1);
                break;
            default: from.setDate(from.getDate() - 1);
        }
        return from;
    }
    async sendDailyDigest() {
        this.logger.log('Running daily digest job (8 AM IST)');
        const digestSchedules = await this.prisma.working.scheduledReport.findMany({
            where: {
                status: 'ACTIVE',
                frequency: 'DAILY',
                reportDef: { code: 'MIS_DAILY_DIGEST' },
            },
            include: { reportDef: true },
        });
        if (!digestSchedules.length) {
            this.logger.log('No active daily digest schedules found');
            return;
        }
        for (const schedule of digestSchedules) {
            await this.processOne(schedule);
        }
    }
    async cleanOldExports() {
        this.logger.log('Running weekly export cleanup');
        const exportDir = path.join(process.cwd(), 'tmp', 'mis-reports');
        if (!fs.existsSync(exportDir))
            return;
        const cutoff = Date.now() - EXPORT_RETENTION_DAYS * 86400000;
        let cleaned = 0;
        try {
            const files = fs.readdirSync(exportDir);
            for (const file of files) {
                const filePath = path.join(exportDir, file);
                const stat = fs.statSync(filePath);
                if (stat.isFile() && stat.mtimeMs < cutoff) {
                    fs.unlinkSync(filePath);
                    cleaned++;
                }
            }
            this.logger.log(`Cleaned ${cleaned} old export files (older than ${EXPORT_RETENTION_DAYS} days)`);
        }
        catch (error) {
            this.logger.error(`Export cleanup failed: ${error instanceof Error ? error.message : error}`);
        }
    }
    daysInMonth(date) {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    }
};
exports.ReportSchedulerService = ReportSchedulerService;
exports.ReportSchedulerService = ReportSchedulerService = ReportSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        report_engine_service_1.ReportEngineService,
        report_emailer_service_1.ReportEmailerService])
], ReportSchedulerService);
//# sourceMappingURL=report-scheduler.service.js.map