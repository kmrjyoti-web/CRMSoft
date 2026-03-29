import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { GetTestDashboardQuery } from './get-test-dashboard.query';

@QueryHandler(GetTestDashboardQuery)
@Injectable()
export class GetTestDashboardHandler implements IQueryHandler<GetTestDashboardQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTestDashboardQuery): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - query.days);

    const [
      totalRuns,
      runsByStatus,
      recentRuns,
      scheduledActive,
      scheduledRunsRecent,
      manualLogs,
      manualByStatus,
      testPlansStats,
    ] = await Promise.all([
      // Total automated test runs
      this.prisma.platform.testRun.count({
        where: { tenantId: query.tenantId, createdAt: { gte: since } },
      }),

      // Auto runs grouped by status
      this.prisma.platform.testRun.groupBy({
        by: ['status'],
        where: { tenantId: query.tenantId, createdAt: { gte: since } },
        _count: { _all: true },
      }),

      // Last 5 automated runs
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

      // Active scheduled tests
      this.prisma.platform.scheduledTest.count({
        where: { tenantId: query.tenantId, isActive: true, isDeleted: false },
      }),

      // Scheduled runs in period
      this.prisma.platform.scheduledTestRun.count({
        where: {
          scheduledTest: { tenantId: query.tenantId },
          startedAt: { gte: since },
        },
      }),

      // Manual test logs in period
      this.prisma.platform.manualTestLog.count({
        where: { tenantId: query.tenantId, createdAt: { gte: since } },
      }),

      // Manual logs by status
      this.prisma.platform.manualTestLog.groupBy({
        by: ['status'],
        where: { tenantId: query.tenantId, createdAt: { gte: since } },
        _count: { _all: true },
      }),

      // Test plans stats
      this.prisma.platform.testPlan.groupBy({
        by: ['status'],
        where: { tenantId: query.tenantId, isActive: true },
        _count: { _all: true },
      }).catch(() => [] as any[]),
    ]);

    // Calculate pass rate for automated runs
    const completedRuns = runsByStatus.find((r: any) => r.status === 'COMPLETED')?._count?._all ?? 0;
    const failedRuns = runsByStatus.find((r: any) => r.status === 'FAILED')?._count?._all ?? 0;
    const passRate = totalRuns > 0 ? Math.round((completedRuns / totalRuns) * 100) : 0;

    // Manual pass/fail
    const manualPassed = manualByStatus.find((r: any) => r.status === 'PASS')?._count?._all ?? 0;
    const manualFailed = manualByStatus.find((r: any) => r.status === 'FAIL')?._count?._all ?? 0;

    return {
      period: { days: query.days, since },
      automated: {
        total: totalRuns,
        passed: completedRuns,
        failed: failedRuns,
        passRate,
        byStatus: runsByStatus.map((r: any) => ({ status: r.status, count: r._count._all })),
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
        byStatus: manualByStatus.map((r: any) => ({ status: r.status, count: r._count._all })),
      },
      testPlans: {
        byStatus: testPlansStats.map((r: any) => ({ status: r.status, count: r._count._all })),
      },
    };
  }
}
