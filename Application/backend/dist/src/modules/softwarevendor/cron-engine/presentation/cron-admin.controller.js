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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CronAdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../../../common/decorators/current-user.decorator");
const api_response_1 = require("../../../../common/utils/api-response");
const prisma_service_1 = require("../../../../core/prisma/prisma.service");
const master_scheduler_service_1 = require("../services/master-scheduler.service");
const cron_analytics_service_1 = require("../services/cron-analytics.service");
const cron_parser_service_1 = require("../services/cron-parser.service");
const job_registry_service_1 = require("../services/job-registry.service");
const update_job_dto_1 = require("./dto/update-job.dto");
const query_dto_1 = require("./dto/query.dto");
let CronAdminController = class CronAdminController {
    constructor(prisma, scheduler, analytics, parser, registry) {
        this.prisma = prisma;
        this.scheduler = scheduler;
        this.analytics = analytics;
        this.parser = parser;
        this.registry = registry;
    }
    async listJobs(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.moduleName)
            where.moduleName = query.moduleName;
        if (query.search)
            where.jobName = { contains: query.search, mode: 'insensitive' };
        const jobs = await this.prisma.working.cronJobConfig.findMany({
            where,
            orderBy: { jobCode: 'asc' },
        });
        return api_response_1.ApiResponse.success(jobs, `Found ${jobs.length} cron jobs`);
    }
    async getJob(jobCode) {
        const job = await this.prisma.working.cronJobConfig.findUnique({
            where: { jobCode },
            include: { runLogs: { take: 10, orderBy: { createdAt: 'desc' } } },
        });
        if (!job)
            return api_response_1.ApiResponse.error('Job not found');
        return api_response_1.ApiResponse.success(job);
    }
    async updateJob(jobCode, dto, user) {
        if (dto.cronExpression && !this.parser.isValid(dto.cronExpression)) {
            return api_response_1.ApiResponse.error('Invalid cron expression');
        }
        const data = { ...dto, updatedById: user.userId, updatedByName: user.userName };
        if (dto.cronExpression) {
            data.cronDescription = this.parser.describe(dto.cronExpression);
        }
        const job = await this.prisma.working.cronJobConfig.update({
            where: { jobCode },
            data,
        });
        await this.scheduler.registerJob(jobCode);
        return api_response_1.ApiResponse.success(job, 'Job updated');
    }
    async toggleJob(jobCode, dto, user) {
        const job = await this.prisma.working.cronJobConfig.update({
            where: { jobCode },
            data: {
                status: dto.status,
                updatedById: user.userId,
                updatedByName: user.userName,
            },
        });
        if (dto.status === 'ACTIVE') {
            await this.scheduler.registerJob(jobCode);
        }
        else {
            this.scheduler.cancelJob(jobCode);
        }
        return api_response_1.ApiResponse.success(job, `Job ${dto.status.toLowerCase()}`);
    }
    async forceRun(jobCode, user) {
        const runLog = await this.scheduler.forceRun(jobCode, `MANUAL:${user.userName}`);
        return api_response_1.ApiResponse.success(runLog, 'Job triggered');
    }
    async reloadAll() {
        await this.scheduler.reloadAll();
        return api_response_1.ApiResponse.success(null, 'All job schedules reloaded');
    }
    async updateParams(jobCode, dto, user) {
        const job = await this.prisma.working.cronJobConfig.update({
            where: { jobCode },
            data: {
                jobParams: dto.jobParams,
                updatedById: user.userId,
                updatedByName: user.userName,
            },
        });
        return api_response_1.ApiResponse.success(job, 'Job params updated');
    }
    async getHistory(jobCode, query) {
        const where = { jobCode };
        if (query.status)
            where.status = query.status;
        if (query.triggeredBy)
            where.triggeredBy = { contains: query.triggeredBy };
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const [data, total] = await Promise.all([
            this.prisma.working.cronJobRunLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.cronJobRunLog.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, page, limit);
    }
    async getAllRuns(query) {
        const where = {};
        if (query.status)
            where.status = query.status;
        const page = query.page ?? 1;
        const limit = query.limit ?? 20;
        const [data, total] = await Promise.all([
            this.prisma.working.cronJobRunLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.working.cronJobRunLog.count({ where }),
        ]);
        return api_response_1.ApiResponse.paginated(data, total, page, limit);
    }
    async getRunDetail(runId) {
        const run = await this.prisma.working.cronJobRunLog.findUnique({ where: { id: runId } });
        if (!run)
            return api_response_1.ApiResponse.error('Run not found');
        return api_response_1.ApiResponse.success(run);
    }
    async getDashboard() {
        const data = await this.analytics.getDashboard();
        return api_response_1.ApiResponse.success(data);
    }
    async getTimeline() {
        const data = await this.analytics.getTimeline();
        return api_response_1.ApiResponse.success(data);
    }
    async getHealth() {
        const data = await this.analytics.getHealth();
        return api_response_1.ApiResponse.success(data);
    }
    async getRegistered() {
        const codes = this.registry.listRegistered();
        return api_response_1.ApiResponse.success(codes, `${codes.length} handlers registered`);
    }
};
exports.CronAdminController = CronAdminController;
__decorate([
    (0, common_1.Get)('jobs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.JobQueryDto]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "listJobs", null);
__decorate([
    (0, common_1.Get)('jobs/:jobCode'),
    __param(0, (0, common_1.Param)('jobCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getJob", null);
__decorate([
    (0, common_1.Put)('jobs/:jobCode'),
    __param(0, (0, common_1.Param)('jobCode')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_job_dto_1.UpdateJobDto, Object]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "updateJob", null);
__decorate([
    (0, common_1.Post)('jobs/:jobCode/toggle'),
    __param(0, (0, common_1.Param)('jobCode')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_job_dto_1.ToggleJobDto, Object]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "toggleJob", null);
__decorate([
    (0, common_1.Post)('jobs/:jobCode/run'),
    __param(0, (0, common_1.Param)('jobCode')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "forceRun", null);
__decorate([
    (0, common_1.Post)('jobs/reload'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "reloadAll", null);
__decorate([
    (0, common_1.Put)('jobs/:jobCode/params'),
    __param(0, (0, common_1.Param)('jobCode')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_job_dto_1.UpdateJobParamsDto, Object]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "updateParams", null);
__decorate([
    (0, common_1.Get)('jobs/:jobCode/history'),
    __param(0, (0, common_1.Param)('jobCode')),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, query_dto_1.RunHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('runs'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_dto_1.RunHistoryQueryDto]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getAllRuns", null);
__decorate([
    (0, common_1.Get)('runs/:runId'),
    __param(0, (0, common_1.Param)('runId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getRunDetail", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Get)('dashboard/timeline'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Get)('dashboard/health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Get)('registered'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CronAdminController.prototype, "getRegistered", null);
exports.CronAdminController = CronAdminController = __decorate([
    (0, swagger_1.ApiTags)('Cron Admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('admin/cron'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        master_scheduler_service_1.MasterSchedulerService,
        cron_analytics_service_1.CronAnalyticsService,
        cron_parser_service_1.CronParserService,
        job_registry_service_1.JobRegistryService])
], CronAdminController);
//# sourceMappingURL=cron-admin.controller.js.map