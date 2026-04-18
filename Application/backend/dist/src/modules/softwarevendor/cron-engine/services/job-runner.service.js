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
var JobRunnerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobRunnerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const job_registry_service_1 = require("./job-registry.service");
const cron_parser_service_1 = require("./cron-parser.service");
const cron_alert_service_1 = require("./cron-alert.service");
const decimal_js_1 = require("decimal.js");
const error_utils_1 = require("../../../../common/utils/error.utils");
let JobRunnerService = JobRunnerService_1 = class JobRunnerService {
    constructor(prisma, registry, parser, alert) {
        this.prisma = prisma;
        this.registry = registry;
        this.parser = parser;
        this.alert = alert;
        this.logger = new common_1.Logger(JobRunnerService_1.name);
    }
    async run(jobCode, triggeredBy = 'SCHEDULER', retryAttempt = 0) {
        const job = await this.prisma.working.cronJobConfig.findUnique({
            where: { jobCode },
        });
        if (!job) {
            this.logger.warn(`Job not found: ${jobCode}`);
            return null;
        }
        if (!job.allowConcurrent && job.isRunning) {
            return this.logSkipped(job, triggeredBy);
        }
        await this.prisma.working.cronJobConfig.update({
            where: { id: job.id },
            data: { isRunning: true },
        });
        const startedAt = new Date();
        const runLog = await this.prisma.working.cronJobRunLog.create({
            data: {
                jobId: job.id,
                jobCode,
                startedAt,
                status: 'RUNNING',
                retryAttempt,
                triggeredBy,
            },
        });
        try {
            const result = await this.executeWithTimeout(job);
            const finishedAt = new Date();
            const durationMs = finishedAt.getTime() - startedAt.getTime();
            const updated = await this.prisma.working.cronJobRunLog.update({
                where: { id: runLog.id },
                data: {
                    status: 'SUCCESS',
                    finishedAt,
                    durationMs,
                    recordsProcessed: result.recordsProcessed,
                    recordsSucceeded: result.recordsSucceeded,
                    recordsFailed: result.recordsFailed,
                    details: result.details,
                },
            });
            await this.updateJobSuccess(job, durationMs, result.recordsProcessed);
            return updated;
        }
        catch (err) {
            return this.handleFailure(job, runLog, err, triggeredBy, retryAttempt);
        }
        finally {
            await this.prisma.working.cronJobConfig.update({
                where: { id: job.id },
                data: { isRunning: false },
            });
        }
    }
    async executeWithTimeout(job) {
        const handler = this.registry.getHandler(job.jobCode);
        if (!handler)
            throw new Error(`No handler registered for ${job.jobCode}`);
        const params = job.jobParams ?? {};
        const timeoutMs = job.timeoutSeconds * 1000;
        if (job.scope === 'TENANT') {
            return this.executeForAllTenants(handler, params, timeoutMs);
        }
        return Promise.race([
            handler.execute(params),
            this.timeout(timeoutMs, job.jobCode),
        ]);
    }
    async executeForAllTenants(handler, params, timeoutMs) {
        const tenants = await this.prisma.tenant.findMany({
            where: { status: 'ACTIVE' },
            select: { id: true },
        });
        let processed = 0, succeeded = 0, failed = 0;
        for (const tenant of tenants) {
            try {
                const r = await Promise.race([
                    handler.execute(params, { tenantId: tenant.id }),
                    this.timeout(timeoutMs, handler.jobCode),
                ]);
                processed += r.recordsProcessed ?? 0;
                succeeded += r.recordsSucceeded ?? 0;
                failed += r.recordsFailed ?? 0;
            }
            catch (err) {
                failed++;
                this.logger.error(`${handler.jobCode} failed for tenant ${tenant.id}: ${(0, error_utils_1.getErrorMessage)(err)}`);
            }
        }
        return { recordsProcessed: processed, recordsSucceeded: succeeded, recordsFailed: failed };
    }
    timeout(ms, jobCode) {
        return new Promise((_, reject) => setTimeout(() => reject(new Error(`TIMEOUT: ${jobCode} exceeded ${ms}ms`)), ms));
    }
    async handleFailure(job, runLog, err, triggeredBy, retryAttempt) {
        const isTimeout = (0, error_utils_1.getErrorMessage)(err)?.startsWith('TIMEOUT:');
        const status = isTimeout ? 'TIMEOUT' : 'FAILED';
        const finishedAt = new Date();
        const durationMs = finishedAt.getTime() - runLog.startedAt.getTime();
        const updated = await this.prisma.working.cronJobRunLog.update({
            where: { id: runLog.id },
            data: {
                status,
                finishedAt,
                durationMs,
                errorMessage: (0, error_utils_1.getErrorMessage)(err),
                errorStack: err.stack?.slice(0, 2000),
            },
        });
        const newConsec = job.consecutiveFailures + 1;
        await this.prisma.working.cronJobConfig.update({
            where: { id: job.id },
            data: {
                lastRunAt: runLog.startedAt,
                lastRunStatus: status,
                lastRunDurationMs: durationMs,
                lastRunError: (0, error_utils_1.getErrorMessage)(err),
                totalFailCount: { increment: 1 },
                totalRunCount: { increment: 1 },
                consecutiveFailures: newConsec,
                isRunning: false,
                nextRunAt: this.safeNextRun(job),
                successRate: this.calcSuccessRate(job.totalRunCount + 1, job.totalFailCount + 1),
            },
        });
        if (newConsec >= job.alertAfterConsecutiveFailures) {
            if ((status === 'FAILED' && job.alertOnFailure) || (status === 'TIMEOUT' && job.alertOnTimeout)) {
                this.alert.sendAlert(job, (0, error_utils_1.getErrorMessage)(err), updated).catch(() => { });
            }
        }
        if (retryAttempt < job.maxRetries) {
            this.logger.warn(`Retrying ${job.jobCode} (attempt ${retryAttempt + 1}/${job.maxRetries})`);
            setTimeout(() => this.run(job.jobCode, 'RETRY', retryAttempt + 1), job.retryDelaySeconds * 1000);
        }
        return updated;
    }
    async logSkipped(job, triggeredBy) {
        this.logger.warn(`Skipping ${job.jobCode} � already running`);
        return this.prisma.working.cronJobRunLog.create({
            data: {
                jobId: job.id,
                jobCode: job.jobCode,
                startedAt: new Date(),
                finishedAt: new Date(),
                durationMs: 0,
                status: 'SKIPPED',
                triggeredBy,
            },
        });
    }
    async updateJobSuccess(job, durationMs, records) {
        const newTotal = job.totalRunCount + 1;
        const newAvg = job.avgDurationMs
            ? Math.round((job.avgDurationMs * job.totalRunCount + durationMs) / newTotal)
            : durationMs;
        await this.prisma.working.cronJobConfig.update({
            where: { id: job.id },
            data: {
                lastRunAt: new Date(),
                lastRunStatus: 'SUCCESS',
                lastRunDurationMs: durationMs,
                lastRunError: null,
                lastRunRecords: records,
                totalRunCount: newTotal,
                consecutiveFailures: 0,
                avgDurationMs: newAvg,
                nextRunAt: this.safeNextRun(job),
                successRate: this.calcSuccessRate(newTotal, job.totalFailCount),
            },
        });
    }
    safeNextRun(job) {
        try {
            return this.parser.getNextRun(job.cronExpression, job.timezone);
        }
        catch {
            return null;
        }
    }
    calcSuccessRate(total, failures) {
        if (total === 0)
            return new decimal_js_1.Decimal(100);
        return new decimal_js_1.Decimal(((total - failures) / total) * 100).toDecimalPlaces(2);
    }
};
exports.JobRunnerService = JobRunnerService;
exports.JobRunnerService = JobRunnerService = JobRunnerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        job_registry_service_1.JobRegistryService,
        cron_parser_service_1.CronParserService,
        cron_alert_service_1.CronAlertService])
], JobRunnerService);
//# sourceMappingURL=job-runner.service.js.map