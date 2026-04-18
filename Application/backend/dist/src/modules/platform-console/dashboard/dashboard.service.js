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
var DashboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
let DashboardService = DashboardService_1 = class DashboardService {
    constructor(db) {
        this.db = db;
        this.logger = new common_1.Logger(DashboardService_1.name);
    }
    async getOverview() {
        try {
            const [errorCount, healthSnapshots, testExecution, deploymentLog] = await Promise.all([
                this.db.globalErrorLog.count({
                    where: {
                        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
                    },
                }),
                this.db.healthSnapshot.findMany({
                    distinct: ['service'],
                    orderBy: { checkedAt: 'desc' },
                    take: 10,
                }),
                this.db.pcTestExecution.findFirst({
                    orderBy: { startedAt: 'desc' },
                }),
                this.db.deploymentLog.findFirst({
                    where: { environment: 'PRODUCTION' },
                    orderBy: { startedAt: 'desc' },
                }),
            ]);
            const healthyServices = healthSnapshots.filter((s) => s.status === 'HEALTHY').length;
            return {
                services: {
                    total: healthSnapshots.length,
                    healthy: healthyServices,
                    allHealthy: healthyServices === healthSnapshots.length,
                },
                errors: {
                    today: errorCount,
                },
                tests: {
                    total: testExecution?.totalTests ?? 0,
                    passed: testExecution?.passed ?? 0,
                    failed: testExecution?.failed ?? 0,
                    status: testExecution?.status ?? 'UNKNOWN',
                },
                lastDeploy: deploymentLog
                    ? {
                        version: deploymentLog.version,
                        status: deploymentLog.status,
                        deployedAt: deploymentLog.startedAt,
                        branch: deploymentLog.gitBranch,
                    }
                    : null,
            };
        }
        catch (error) {
            this.logger.error(`DashboardService.getOverview failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getHealth() {
        try {
            const snapshots = await this.db.healthSnapshot.findMany({
                distinct: ['service'],
                orderBy: { checkedAt: 'desc' },
            });
            return snapshots;
        }
        catch (error) {
            this.logger.error(`DashboardService.getHealth failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getErrorsSummary() {
        try {
            const [recent, bySeverity] = await Promise.all([
                this.db.globalErrorLog.findMany({
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    select: {
                        id: true,
                        severity: true,
                        errorCode: true,
                        message: true,
                        module: true,
                        endpoint: true,
                        httpStatus: true,
                        createdAt: true,
                    },
                }),
                this.db.globalErrorLog.groupBy({
                    by: ['severity'],
                    _count: { id: true },
                    where: {
                        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
                    },
                }),
            ]);
            return { recent, bySeverity };
        }
        catch (error) {
            this.logger.error(`DashboardService.getErrorsSummary failed: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getTestsSummary() {
        try {
            const executions = await this.db.pcTestExecution.findMany({
                orderBy: { startedAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    triggerType: true,
                    totalTests: true,
                    passed: true,
                    failed: true,
                    coverage: true,
                    status: true,
                    duration: true,
                    startedAt: true,
                },
            });
            return executions;
        }
        catch (error) {
            this.logger.error(`DashboardService.getTestsSummary failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = DashboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map