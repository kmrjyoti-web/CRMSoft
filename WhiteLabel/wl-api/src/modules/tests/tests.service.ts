import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TestsService {
  constructor(private prisma: PrismaService, private audit: AuditService) {}

  async collectTestResults(partnerId: string, result: {
    testType: string;
    totalTests: number;
    passed: number;
    failed: number;
    warnings?: number;
    triggeredBy?: string;
    startedAt?: Date;
    completedAt?: Date;
    categories?: any;
  }) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    const passRate = result.totalTests > 0 ? (result.passed / result.totalTests) * 100 : 0;

    const log = await this.prisma.partnerTestLog.create({
      data: {
        partnerId,
        ...result,
        passRate,
        warnings: result.warnings ?? 0,
        startedAt: result.startedAt ?? new Date(),
        completedAt: result.completedAt ?? new Date(),
      },
    });

    await this.audit.log({
      partnerId,
      action: 'TEST_RESULTS_COLLECTED',
      performedBy: result.triggeredBy || 'system',
      performedByRole: 'MASTER_ADMIN',
      details: { testType: result.testType, passRate, totalTests: result.totalTests },
    });

    return log;
  }

  async triggerPartnerTest(partnerId: string, testType: string) {
    const partner = await this.prisma.whiteLabelPartner.findUnique({ where: { id: partnerId } });
    if (!partner) throw new NotFoundException('Partner not found');

    // In production: call partner's CRM API to trigger test
    // For now: create a mock pending log
    const log = await this.prisma.partnerTestLog.create({
      data: {
        partnerId,
        testType,
        totalTests: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        triggeredBy: 'admin',
        startedAt: new Date(),
      },
    });

    await this.audit.log({
      partnerId,
      action: 'TEST_TRIGGERED',
      performedBy: 'admin',
      performedByRole: 'MASTER_ADMIN',
      details: { testType },
    });

    return {
      triggered: true,
      logId: log.id,
      testType,
      message: `${testType} test triggered for partner ${partner.partnerCode}`,
    };
  }

  async getPartnerTests(partnerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.partnerTestLog.findMany({ where: { partnerId }, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.partnerTestLog.count({ where: { partnerId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTestDashboard(partnerId?: string) {
    const where: any = partnerId ? { partnerId } : {};
    const [total, recentLogs] = await Promise.all([
      this.prisma.partnerTestLog.count({ where }),
      this.prisma.partnerTestLog.findMany({ where, take: 10, orderBy: { createdAt: 'desc' } }),
    ]);
    const avgPassRate =
      recentLogs.length > 0
        ? recentLogs.reduce((sum, l) => sum + (l.passRate || 0), 0) / recentLogs.length
        : 0;
    return { totalRuns: total, avgPassRate: Math.round(avgPassRate * 10) / 10, recentLogs };
  }
}
