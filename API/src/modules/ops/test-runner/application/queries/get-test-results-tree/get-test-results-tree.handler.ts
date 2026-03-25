import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '@core/prisma/prisma.service';
import { GetTestResultsTreeQuery } from './get-test-results-tree.query';

@QueryHandler(GetTestResultsTreeQuery)
export class GetTestResultsTreeHandler implements IQueryHandler<GetTestResultsTreeQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetTestResultsTreeQuery): Promise<any> {
    const results = await this.prisma.platform.testResult.findMany({
      where: { testRunId: query.testRunId },
      orderBy: [{ testType: 'asc' }, { suiteName: 'asc' }, { testName: 'asc' }],
    });

    // Build tree: { [testType]: { [suiteName]: SingleTestResult[] } }
    const tree: Record<string, Record<string, any[]>> = {};

    for (const r of results) {
      const type = r.testType as string;
      const suite = r.suiteName;

      if (!tree[type]) tree[type] = {};
      if (!tree[type][suite]) tree[type][suite] = [];

      tree[type][suite].push(r);
    }

    // Convert to array format with summary per suite and type
    return Object.entries(tree).map(([testType, suites]) => {
      const suiteList = Object.entries(suites).map(([suiteName, tests]) => ({
        suiteName,
        total: tests.length,
        passed: tests.filter(t => t.status === 'PASS').length,
        failed: tests.filter(t => t.status === 'FAIL').length,
        skipped: tests.filter(t => t.status === 'SKIP').length,
        errors: tests.filter(t => ['ERROR', 'TIMEOUT'].includes(t.status)).length,
        duration: tests.reduce((sum: number, t: any) => sum + (t.duration ?? 0), 0),
        tests,
      }));

      const typeTotal = suiteList.reduce((acc, s) => {
        acc.total += s.total; acc.passed += s.passed;
        acc.failed += s.failed; acc.skipped += s.skipped;
        acc.errors += s.errors; acc.duration += s.duration;
        return acc;
      }, { total: 0, passed: 0, failed: 0, skipped: 0, errors: 0, duration: 0 });

      return { testType, ...typeTotal, suites: suiteList };
    });
  }
}
