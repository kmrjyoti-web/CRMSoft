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
var GetTestDashboardHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetTestDashboardHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const get_test_dashboard_query_1 = require("./get-test-dashboard.query");
let GetTestDashboardHandler = GetTestDashboardHandler_1 = class GetTestDashboardHandler {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GetTestDashboardHandler_1.name);
    }
    async execute(query) {
        try {
            const since = new Date();
            since.setDate(since.getDate() - query.days);
            const [totalRuns, runsByStatus, recentRuns, scheduledActive, scheduledRunsRecent, manualLogs, manualByStatus, testPlansStats,] = await Promise.all([
                this.prisma.platform.testRun.count({
                    where: { tenantId: query.tenantId, createdAt: { gte: since } },
                }),
                this.prisma.platform.testRun.groupBy({
                    by: ['status'],
                    where: { tenantId: query.tenantId, createdAt: { gte: since } },
                    _count: { _all: true },
                }),
                this.prisma.platform.testRun.findMany({
                    where: { tenantId: query.tenantId },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                    select: {
                        id: true,
                        status: true,
                        testTypes: true,
                        passed: true,
                        failed: true,
                        totalTests: true,
                        createdAt: true,
                        completedAt: true,
                    },
                }),
                this.prisma.platform.scheduledTest.count({
                    where: { tenantId: query.tenantId, isActive: true, isDeleted: false },
                }),
                this.prisma.platform.scheduledTestRun.count({
                    where: {
                        scheduledTest: { tenantId: query.tenantId },
                        startedAt: { gte: since },
                    },
                }),
                this.prisma.platform.manualTestLog.count({
                    where: { tenantId: query.tenantId, createdAt: { gte: since } },
                }),
                this.prisma.platform.manualTestLog.groupBy({
                    by: ['status'],
                    where: { tenantId: query.tenantId, createdAt: { gte: since } },
                    _count: { _all: true },
                }),
                this.prisma.platform.testPlan.groupBy({
                    by: ['status'],
                    where: { tenantId: query.tenantId, isActive: true },
                    _count: { _all: true },
                }).catch(() => []),
            ]);
            const completedRuns = runsByStatus.find((r) => r.status === 'COMPLETED')?._count?._all ?? 0;
            const failedRuns = runsByStatus.find((r) => r.status === 'FAILED')?._count?._all ?? 0;
            const passRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;
            const manualPassed = manualByStatus.find((r) => r.status === 'PASS')?._count?._all ?? 0;
            const manualFailed = manualByStatus.find((r) => r.status === 'FAIL')?._count?._all ?? 0;
            return {
                period: { days: query.days, since },
                automated: {
                    total: totalRuns,
                    passed: completedRuns,
                    failed: failedRuns,
                    passRate,
                    byStatus: runsByStatus.map((r) => ({ status: r.status, count: r._count._all })),
                    recentRuns,
                },
                scheduled: {
                    activeSchedules: scheduledActive,
                    runsInPeriod: scheduledRunsRecent,
                },
                manual: {
                    total: manualLogs,
                    passed: manualPassed,
                    failed: manualFailed,
                    byStatus: manualByStatus.map((r) => ({ status: r.status, count: r._count._all })),
                },
                testPlans: {
                    byStatus: testPlansStats.map((r) => ({ status: r.status, count: r._count._all })),
                },
            };
        }
        catch (error) {
            this.logger.error(`GetTestDashboardHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.GetTestDashboardHandler = GetTestDashboardHandler;
exports.GetTestDashboardHandler = GetTestDashboardHandler = GetTestDashboardHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(get_test_dashboard_query_1.GetTestDashboardQuery),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GetTestDashboardHandler);
//# sourceMappingURL=get-test-dashboard.handler.js.map