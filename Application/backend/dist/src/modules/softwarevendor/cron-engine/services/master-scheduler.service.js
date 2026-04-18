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
var MasterSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MasterSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const cron = require("node-cron");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const job_runner_service_1 = require("./job-runner.service");
const cron_parser_service_1 = require("./cron-parser.service");
let MasterSchedulerService = MasterSchedulerService_1 = class MasterSchedulerService {
    constructor(prisma, runner, parser) {
        this.prisma = prisma;
        this.runner = runner;
        this.parser = parser;
        this.logger = new common_1.Logger(MasterSchedulerService_1.name);
        this.scheduledTasks = new Map();
    }
    async onModuleInit() {
        if (process.env.DISABLE_CRON === 'true') {
            this.logger.log('Cron jobs disabled via DISABLE_CRON env var');
            return;
        }
        const jobs = await this.prisma.working.cronJobConfig.findMany();
        let registered = 0;
        for (const job of jobs) {
            if (job.status !== 'ACTIVE')
                continue;
            if (!cron.validate(job.cronExpression)) {
                this.logger.warn(`Invalid cron expression for ${job.jobCode}: ${job.cronExpression}`);
                continue;
            }
            this.scheduleJob(job.jobCode, job.cronExpression, job.timezone);
            await this.updateNextRun(job.jobCode, job.cronExpression, job.timezone);
            registered++;
        }
        this.logger.log(`Registered ${registered}/${jobs.length} cron jobs`);
    }
    onModuleDestroy() {
        for (const [code, task] of this.scheduledTasks) {
            void task.stop();
            this.logger.log(`Stopped job: ${code}`);
        }
        this.scheduledTasks.clear();
    }
    async registerJob(jobCode) {
        this.cancelJobSync(jobCode);
        const job = await this.prisma.working.cronJobConfig.findUnique({
            where: { jobCode },
        });
        if (!job || job.status !== 'ACTIVE')
            return;
        if (!cron.validate(job.cronExpression)) {
            this.logger.warn(`Invalid cron: ${job.jobCode} → ${job.cronExpression}`);
            return;
        }
        this.scheduleJob(job.jobCode, job.cronExpression, job.timezone);
        await this.updateNextRun(job.jobCode, job.cronExpression, job.timezone);
        this.logger.log(`Re-registered job: ${jobCode}`);
    }
    cancelJob(jobCode) {
        this.cancelJobSync(jobCode);
        this.logger.log(`Cancelled job: ${jobCode}`);
    }
    async reloadAll() {
        for (const task of this.scheduledTasks.values())
            void task.stop();
        this.scheduledTasks.clear();
        await this.onModuleInit();
    }
    async forceRun(jobCode, triggeredBy) {
        return this.runner.run(jobCode, triggeredBy);
    }
    getScheduledStatus() {
        const result = [];
        for (const [code] of this.scheduledTasks) {
            let nextRun = null;
            try {
                nextRun = this.parser.getNextRun(code);
            }
            catch { }
            result.push({ jobCode: code, isScheduled: true, nextRun });
        }
        return result;
    }
    scheduleJob(jobCode, expression, timezone) {
        const task = cron.schedule(expression, () => {
            this.runner.run(jobCode, 'SCHEDULER').catch((err) => {
                this.logger.error(`Scheduler error for ${jobCode}: ${err.message}`);
            });
        }, { timezone });
        this.scheduledTasks.set(jobCode, task);
    }
    cancelJobSync(jobCode) {
        const existing = this.scheduledTasks.get(jobCode);
        if (existing) {
            void existing.stop();
            this.scheduledTasks.delete(jobCode);
        }
    }
    async updateNextRun(jobCode, expression, timezone) {
        try {
            const nextRunAt = this.parser.getNextRun(expression, timezone);
            await this.prisma.working.cronJobConfig.update({
                where: { jobCode },
                data: { nextRunAt },
            });
        }
        catch { }
    }
};
exports.MasterSchedulerService = MasterSchedulerService;
exports.MasterSchedulerService = MasterSchedulerService = MasterSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        job_runner_service_1.JobRunnerService,
        cron_parser_service_1.CronParserService])
], MasterSchedulerService);
//# sourceMappingURL=master-scheduler.service.js.map