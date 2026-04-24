import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import type { TestErrorCategory, TestSeverity } from '@prisma/platform-client';

export interface ErrorCategorization {
  category: TestErrorCategory;
  severity: TestSeverity;
  isReportable: boolean;
}

export interface ErrorDashboardData {
  period: { days: number; from: Date; to: Date };
  total: number;
  unresolved: number;
  critical: number;
  resolutionRate: number;
  meanTimeToResolutionMs: number | null;
  byCategory: Record<string, number>;
  bySeverity: Record<string, number>;
  trend: Array<{ date: string; count: number }>;
  top10: Array<{ message: string; count: number; category: string }>;
}

@Injectable()
export class TestErrorAnalyzerService {
  private readonly logger = new Logger(TestErrorAnalyzerService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ─────────────────────────────────────────────────────────
  // CATEGORIZE ERROR
  // ─────────────────────────────────────────────────────────

  categorizeError(errorMessage: string, context?: { filePath?: string; suiteName?: string }): ErrorCategorization {
    const msg = (errorMessage ?? '').toLowerCase();
    const suite = (context?.suiteName ?? '').toLowerCase();
    const file = (context?.filePath ?? '').toLowerCase();

    let category: TestErrorCategory = 'OTHER';
    let severity: TestSeverity = 'MEDIUM';

    // DATABASE errors
    if (/p2002|p2025|p2003|p2000|foreign key|unique constraint|not null|constraint failed|database/.test(msg) ||
        suite.includes('db validation') || suite.includes('foreign key') || suite.includes('null constraint')) {
      category = 'DATABASE';
      severity = /p2002|unique|p2003|foreign key/.test(msg) ? 'HIGH' : 'MEDIUM';
    }
    // VALIDATION errors
    else if (/validation failed|is required|invalid|must be|should be|too short|too long|pattern/.test(msg) ||
             suite.includes('validation')) {
      category = 'VALIDATION';
      severity = 'LOW';
    }
    // SECURITY errors
    else if (/unauthorized|forbidden|401|403|token|auth|injection|xss|csrf|bypass|payload reflected/.test(msg) ||
             suite.includes('sql injection') || suite.includes('xss') || suite.includes('auth bypass') || suite.includes('security')) {
      category = 'SECURITY';
      severity = /sql injection|xss|bypass/.test(msg) ? 'CRITICAL' : 'HIGH';
    }
    // API_CONTRACT errors
    else if (/expected.*got|status code|response shape|required field|missing field|api contract/.test(msg) ||
             suite.includes('api') || suite.includes('contract') || suite.includes('smoke')) {
      category = 'API_CONTRACT';
      severity = 'HIGH';
    }
    // ARCHITECTURE errors
    else if (/circular|import|barrel|module boundary|layer purity|dependency|naming convention|kebab|pascal/.test(msg) ||
             suite.includes('architecture') || suite.includes('dependency') || suite.includes('naming') || suite.includes('illegal')) {
      category = 'ARCHITECTURE';
      severity = /circular dependency/.test(msg) ? 'HIGH' : 'LOW';
    }
    // CONFIGURATION errors
    else if (/econnrefused|timeout|cannot connect|connection refused|config|environment/.test(msg)) {
      category = 'CONFIGURATION';
      severity = 'HIGH';
    }
    // PERFORMANCE errors
    else if (/slow|memory|large|performance|took.*ms|timeout.*ms/.test(msg)) {
      category = 'PERFORMANCE';
      severity = 'MEDIUM';
    }
    // UI_RENDER errors
    else if (/render|hydration|component|react|dom/.test(msg) || file.includes('/ui/') || file.includes('/components/')) {
      category = 'UI_RENDER';
      severity = 'MEDIUM';
    }
    // FUNCTIONAL (default for broken core behavior)
    else if (/cannot read|undefined|null|typeerror|referenceerror|error:/.test(msg)) {
      category = 'FUNCTIONAL';
      severity = 'HIGH';
    }

    // Override severity for data-loss/critical scenarios
    if (/data loss|drop table|delete all|truncate|orphan record/.test(msg)) {
      severity = 'CRITICAL';
    }

    // Only CRITICAL and HIGH are reportable to vendor
    const isReportable = severity === 'CRITICAL' || severity === 'HIGH';

    return { category, severity, isReportable };
  }

  // ─────────────────────────────────────────────────────────
  // PERSIST ERROR LOGS FROM A TEST RUN
  // ─────────────────────────────────────────────────────────

  async persistRunErrors(testRunId: string): Promise<number> {
    const failedResults = await this.prisma.platform.testResult.findMany({
      where: { testRunId, status: { in: ['FAIL', 'ERROR'] } },
      select: {
        id: true, suiteName: true, testName: true, module: true,
        filePath: true, errorMessage: true, errorStack: true,
      },
    });

    if (failedResults.length === 0) return 0;

    const errorLogs = failedResults.map(r => {
      const { category, severity, isReportable } = this.categorizeError(
        r.errorMessage ?? r.testName,
        { suiteName: r.suiteName, filePath: r.filePath ?? undefined },
      );
      return {
        testRunId,
        testResultId: r.id,
        errorCategory: category,
        severity,
        isReportable,
        message: r.errorMessage ?? r.testName,
        stackTrace: r.errorStack,
        moduleName: r.module,
        filePath: r.filePath,
      };
    });

    await this.prisma.platform.testErrorLog.createMany({ data: errorLogs });
    this.logger.log(`Persisted ${errorLogs.length} error log(s) for run ${testRunId}`);
    return errorLogs.length;
  }

  // ─────────────────────────────────────────────────────────
  // REPORT TO VENDOR
  // ─────────────────────────────────────────────────────────

  async reportToVendor(errorId: string, context?: string): Promise<void> {
    const error = await this.prisma.platform.testErrorLog.findUnique({ where: { id: errorId } });
    if (!error) throw new NotFoundException(`TestErrorLog ${errorId} not found`);

    if (error.severity === 'LOW' || error.severity === 'MEDIUM') {
      throw new Error(`Only HIGH or CRITICAL errors can be reported to vendor. Current severity: ${error.severity}`);
    }

    await this.prisma.platform.testErrorLog.update({
      where: { id: errorId },
      data: { reportedToVendor: true, reportedAt: new Date(), vendorResponse: context ?? null },
    });

    this.logger.log(`Error ${errorId} reported to vendor (severity: ${error.severity})`);
  }

  // ─────────────────────────────────────────────────────────
  // MARK RESOLVED
  // ─────────────────────────────────────────────────────────

  async markResolved(errorId: string, resolvedBy: string, resolution: string): Promise<void> {
    await this.prisma.platform.testErrorLog.update({
      where: { id: errorId },
      data: { isResolved: true, resolvedBy, resolvedAt: new Date(), resolution },
    });
  }

  // ─────────────────────────────────────────────────────────
  // ERROR DASHBOARD
  // ─────────────────────────────────────────────────────────

  async getErrorDashboard(tenantId: string | null, days = 30): Promise<ErrorDashboardData> {
    const from = new Date();
    from.setDate(from.getDate() - days);
    const to = new Date();

    const where = { createdAt: { gte: from } };

    const [total, unresolved, critical, byCategoryRaw, bySeverityRaw, trendRaw, resolvedLogs] =
      await Promise.all([
        this.prisma.platform.testErrorLog.count({ where }),
        this.prisma.platform.testErrorLog.count({ where: { ...where, isResolved: false } }),
        this.prisma.platform.testErrorLog.count({ where: { ...where, severity: 'CRITICAL', isResolved: false } }),
        this.prisma.platform.testErrorLog.groupBy({ by: ['errorCategory'], where, _count: { id: true } }),
        this.prisma.platform.testErrorLog.groupBy({ by: ['severity'], where, _count: { id: true } }),
        this.prisma.platform.$queryRaw<Array<{ date: string; count: bigint }>>`
          SELECT DATE("created_at")::text AS date, COUNT(*) AS count
          FROM "test_error_logs"
          WHERE "created_at" >= ${from}
          GROUP BY DATE("created_at")
          ORDER BY DATE("created_at") ASC
        `,
        this.prisma.platform.testErrorLog.findMany({
          where: { ...where, isResolved: true, resolvedAt: { not: null } },
          select: { createdAt: true, resolvedAt: true },
        }),
      ]);

    const resolutionRate = total > 0 ? Math.round(((total - unresolved) / total) * 100) : 0;

    let meanTimeToResolutionMs: number | null = null;
    if (resolvedLogs.length > 0) {
      const totalMs = resolvedLogs.reduce((sum, l) => {
        return sum + (l.resolvedAt!.getTime() - l.createdAt.getTime());
      }, 0);
      meanTimeToResolutionMs = Math.round(totalMs / resolvedLogs.length);
    }

    const byCategory: Record<string, number> = {};
    for (const row of byCategoryRaw) {
      byCategory[row.errorCategory] = row._count.id;
    }

    const bySeverity: Record<string, number> = {};
    for (const row of bySeverityRaw) {
      bySeverity[row.severity] = row._count.id;
    }

    const trend = trendRaw.map(r => ({ date: r.date, count: Number(r.count) }));

    // Top 10 most frequent error messages
    const allErrors = await this.prisma.platform.testErrorLog.findMany({
      where,
      select: { message: true, errorCategory: true },
    });
    const messageFreq: Record<string, { count: number; category: string }> = {};
    for (const e of allErrors) {
      const key = e.message.substring(0, 100);
      if (!messageFreq[key]) messageFreq[key] = { count: 0, category: e.errorCategory };
      messageFreq[key].count++;
    }
    const top10 = Object.entries(messageFreq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([message, v]) => ({ message, count: v.count, category: v.category }));

    return {
      period: { days, from, to },
      total,
      unresolved,
      critical,
      resolutionRate,
      meanTimeToResolutionMs,
      byCategory,
      bySeverity,
      trend,
      top10,
    };
  }

  // ─────────────────────────────────────────────────────────
  // GENERATE TEST REPORT
  // ─────────────────────────────────────────────────────────

  async generateReport(testRunId: string): Promise<string> {
    const run = await this.prisma.platform.testRun.findUnique({
      where: { id: testRunId },
      include: { results: true, errorLogs: true },
    });
    if (!run) throw new NotFoundException(`TestRun ${testRunId} not found`);

    const byCategory: Record<string, { total: number; passed: number; failed: number }> = {};
    const byModule: Record<string, { total: number; passed: number; failed: number }> = {};

    for (const r of run.results) {
      const cat = r.testType;
      if (!byCategory[cat]) byCategory[cat] = { total: 0, passed: 0, failed: 0 };
      byCategory[cat].total++;
      if (r.status === 'PASS') byCategory[cat].passed++;
      if (r.status === 'FAIL' || r.status === 'ERROR') byCategory[cat].failed++;

      const mod = r.module ?? 'general';
      if (!byModule[mod]) byModule[mod] = { total: 0, passed: 0, failed: 0 };
      byModule[mod].total++;
      if (r.status === 'PASS') byModule[mod].passed++;
      if (r.status === 'FAIL' || r.status === 'ERROR') byModule[mod].failed++;
    }

    const errorSummary = {
      total: run.errorLogs.length,
      critical: run.errorLogs.filter(e => e.severity === 'CRITICAL').length,
      high: run.errorLogs.filter(e => e.severity === 'HIGH').length,
      reportable: run.errorLogs.filter(e => e.isReportable).length,
    };

    const recommendations: string[] = [];
    if (errorSummary.critical > 0) recommendations.push(`${errorSummary.critical} CRITICAL error(s) require immediate attention`);
    if (run.failed > run.passed * 0.2) recommendations.push('Failure rate exceeds 20% — consider rolling back recent changes');

    const summary = {
      runId: testRunId,
      status: run.status,
      totalTests: run.totalTests,
      passed: run.passed,
      failed: run.failed,
      passRate: run.totalTests > 0 ? Math.round((run.passed / run.totalTests) * 100) : 0,
      duration: run.duration,
    };

    // Upsert the report
    await this.prisma.platform.testReport.upsert({
      where: { testRunId },
      create: {
        testRunId,
        summary,
        categoryResults: byCategory,
        moduleResults: byModule,
        errorSummary,
        recommendations,
      },
      update: {
        summary,
        categoryResults: byCategory,
        moduleResults: byModule,
        errorSummary,
        recommendations,
      },
    });

    return testRunId;
  }
}
