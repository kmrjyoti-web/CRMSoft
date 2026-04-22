import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@core/prisma/prisma.service';
import { NotFoundException, Logger } from '@nestjs/common';
import { CompareTestRunsQuery } from './compare-test-runs.query';

@QueryHandler(CompareTestRunsQuery)
export class CompareTestRunsHandler implements IQueryHandler<CompareTestRunsQuery> {
    private readonly logger = new Logger(CompareTestRunsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: CompareTestRunsQuery): Promise<Record<string, unknown>> {
    try {
      const [run1, run2] = await Promise.all([
        this.prisma.platform.testRun.findUnique({
          where: { id: query.runId1 },
          include: { results: true },
        }),
        this.prisma.platform.testRun.findUnique({
          where: { id: query.runId2 },
          include: { results: true },
        }),
      ]);

      if (!run1) throw new NotFoundException(`TestRun not found: ${query.runId1}`);
      if (!run2) throw new NotFoundException(`TestRun not found: ${query.runId2}`);

      // Build test maps by (suiteName + testName) key
      const run1Map = new Map<string, any>(
        (run1.results ?? []).map((r: Record<string, unknown>) => [`${r.testType}::${r.suiteName}::${r.testName}`, r]),
      );
      const run2Map = new Map<string, any>(
        (run2.results ?? []).map((r: Record<string, unknown>) => [`${r.testType}::${r.suiteName}::${r.testName}`, r]),
      );

      const allKeys = new Set([...run1Map.keys(), ...run2Map.keys()]);

      const diff: any[] = [];
      for (const key of allKeys) {
        const r1 = run1Map.get(key);
        const r2 = run2Map.get(key);

        if (!r1) {
          diff.push({ key, change: 'ADDED', run2: r2 });
        } else if (!r2) {
          diff.push({ key, change: 'REMOVED', run1: r1 });
        } else if (r1.status !== r2.status) {
          diff.push({
            key, change: 'STATUS_CHANGED',
            run1: { status: r1.status },
            run2: { status: r2.status },
            regression: r1.status === 'PASS' && r2.status !== 'PASS',
            improvement: r1.status !== 'PASS' && r2.status === 'PASS',
          });
        }
      }

      const regressions = diff.filter(d => d.regression).length;
      const improvements = diff.filter(d => d.improvement).length;

      return {
        run1: { id: run1.id, createdAt: run1.createdAt, passed: run1.passed, failed: run1.failed, total: run1.totalTests },
        run2: { id: run2.id, createdAt: run2.createdAt, passed: run2.passed, failed: run2.failed, total: run2.totalTests },
        summary: { regressions, improvements, added: diff.filter(d => d.change === 'ADDED').length, removed: diff.filter(d => d.change === 'REMOVED').length },
        diff,
      };
    } catch (error) {
      this.logger.error(`CompareTestRunsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
