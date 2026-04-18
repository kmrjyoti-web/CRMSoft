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
var TestCenterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCenterService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const test_center_errors_1 = require("./test-center.errors");
let TestCenterService = TestCenterService_1 = class TestCenterService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(TestCenterService_1.name);
    }
    async createTestPlan(dto) {
        try {
            const plan = await this.db.pcTestPlan.create({
                data: {
                    name: dto.name,
                    description: dto.description,
                    moduleScope: dto.moduleScope,
                    verticalScope: dto.verticalScope,
                    scenarios: dto.scenarios,
                    createdBy: dto.createdBy,
                },
            });
            this.logger.log(`Test plan created: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error('Failed to create test plan', error.stack);
            throw error;
        }
    }
    async getTestPlans(params) {
        try {
            const page = params.page || 1;
            const limit = params.limit || 20;
            const skip = (page - 1) * limit;
            const [data, total] = await Promise.all([
                this.db.pcTestPlan.findMany({
                    skip,
                    take: limit,
                    orderBy: { createdAt: 'desc' },
                    include: { _count: { select: { executions: true } } },
                }),
                this.db.pcTestPlan.count(),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to get test plans', error.stack);
            throw error;
        }
    }
    async getTestPlan(id) {
        try {
            const plan = await this.db.pcTestPlan.findUnique({
                where: { id },
                include: {
                    executions: {
                        orderBy: { startedAt: 'desc' },
                        take: 5,
                    },
                },
            });
            if (!plan) {
                const err = test_center_errors_1.TEST_CENTER_ERRORS.PLAN_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return plan;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to get test plan ${id}`, error.stack);
            throw error;
        }
    }
    async updateTestPlan(id, data) {
        try {
            const plan = await this.db.pcTestPlan.update({
                where: { id },
                data: {
                    ...(data.name !== undefined && { name: data.name }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.scenarios !== undefined && { scenarios: data.scenarios }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                },
            });
            this.logger.log(`Test plan updated: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to update test plan ${id}`, error.stack);
            throw error;
        }
    }
    async deleteTestPlan(id) {
        try {
            const plan = await this.db.pcTestPlan.update({
                where: { id },
                data: { isActive: false },
            });
            this.logger.log(`Test plan soft-deleted: ${plan.id}`);
            return plan;
        }
        catch (error) {
            this.logger.error(`Failed to delete test plan ${id}`, error.stack);
            throw error;
        }
    }
    async getExecutions(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 20;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.status)
                where.status = filters.status;
            if (filters.moduleScope)
                where.moduleScope = filters.moduleScope;
            if (filters.triggerType)
                where.triggerType = filters.triggerType;
            const [data, total] = await Promise.all([
                this.db.pcTestExecution.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { startedAt: 'desc' },
                }),
                this.db.pcTestExecution.count({ where }),
            ]);
            return { data, total };
        }
        catch (error) {
            this.logger.error('Failed to get executions', error.stack);
            throw error;
        }
    }
    async getExecution(id) {
        try {
            const execution = await this.db.pcTestExecution.findUnique({ where: { id } });
            if (!execution) {
                const err = test_center_errors_1.TEST_CENTER_ERRORS.EXECUTION_NOT_FOUND;
                throw new common_1.HttpException({ code: err.code, message: err.message, messageHi: err.messageHi }, err.statusCode);
            }
            return execution;
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            this.logger.error(`Failed to get execution ${id}`, error.stack);
            throw error;
        }
    }
    async getLatestExecution() {
        try {
            return await this.db.pcTestExecution.findFirst({
                orderBy: { startedAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to get latest execution', error.stack);
            throw error;
        }
    }
    async getSchedules() {
        try {
            return await this.db.pcTestSchedule.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            this.logger.error('Failed to get schedules', error.stack);
            throw error;
        }
    }
    async createSchedule(dto) {
        try {
            const schedule = await this.db.pcTestSchedule.create({
                data: {
                    planId: dto.planId,
                    scheduleType: dto.scheduleType,
                    cronExpression: dto.cronExpression,
                    moduleScope: dto.moduleScope,
                    verticalScope: dto.verticalScope,
                    brandScope: dto.brandScope,
                    nextRun: null,
                },
            });
            this.logger.log(`Test schedule created: ${schedule.id}`);
            return schedule;
        }
        catch (error) {
            this.logger.error('Failed to create schedule', error.stack);
            throw error;
        }
    }
    async updateSchedule(id, data) {
        try {
            const schedule = await this.db.pcTestSchedule.update({
                where: { id },
                data: {
                    ...(data.cronExpression !== undefined && { cronExpression: data.cronExpression }),
                    ...(data.isActive !== undefined && { isActive: data.isActive }),
                    ...(data.moduleScope !== undefined && { moduleScope: data.moduleScope }),
                },
            });
            this.logger.log(`Test schedule updated: ${schedule.id}`);
            return schedule;
        }
        catch (error) {
            this.logger.error(`Failed to update schedule ${id}`, error.stack);
            throw error;
        }
    }
    async deleteSchedule(id) {
        try {
            const schedule = await this.db.pcTestSchedule.delete({ where: { id } });
            this.logger.log(`Test schedule deleted: ${id}`);
            return schedule;
        }
        catch (error) {
            this.logger.error(`Failed to delete schedule ${id}`, error.stack);
            throw error;
        }
    }
    async getStats() {
        try {
            const [totalPlans, totalExecutions, lastRun, schedulesActive, coverageRecords, recentExecutions] = await Promise.all([
                this.db.pcTestPlan.count(),
                this.db.pcTestExecution.count(),
                this.db.pcTestExecution.findFirst({ orderBy: { startedAt: 'desc' } }),
                this.db.pcTestSchedule.count({ where: { isActive: true } }),
                this.db.pcTestCoverage.findMany(),
                this.db.pcTestExecution.findMany({ orderBy: { startedAt: 'desc' }, take: 5 }),
            ]);
            const coverageAvg = coverageRecords.length > 0
                ? coverageRecords.reduce((sum, r) => sum + (r.lineCoverage || 0), 0) / coverageRecords.length
                : 0;
            return {
                totalPlans,
                totalExecutions,
                lastRun,
                schedulesActive,
                coverageAvg: Math.round(coverageAvg * 100) / 100,
                recentExecutions,
            };
        }
        catch (error) {
            this.logger.error('Failed to get stats', error.stack);
            throw error;
        }
    }
};
exports.TestCenterService = TestCenterService;
exports.TestCenterService = TestCenterService = TestCenterService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], TestCenterService);
//# sourceMappingURL=test-center.service.js.map