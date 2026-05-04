import { Injectable, Logger } from '@nestjs/common';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly db: PlatformConsolePrismaService) {}

  async getOverview() {
    try {
      const [errorCount, healthSnapshots, testExecution, deploymentLog] =
        await Promise.all([
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

      const healthyServices = healthSnapshots.filter(
        (s: any) => s.status === 'HEALTHY',
      ).length;

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
    } catch (error) {
      this.logger.error(
        `DashboardService.getOverview failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
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
    } catch (error) {
      this.logger.error(
        `DashboardService.getHealth failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
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
    } catch (error) {
      this.logger.error(
        `DashboardService.getErrorsSummary failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
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
    } catch (error) {
      this.logger.error(
        `DashboardService.getTestsSummary failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw error;
    }
  }
}
