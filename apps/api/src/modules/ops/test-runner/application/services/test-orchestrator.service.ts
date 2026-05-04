import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@core/prisma/prisma.service';
import { TestType } from '@prisma/platform-client';
import { UnitTestRunner } from '../../infrastructure/runners/unit-test.runner';
import { FunctionalTestRunner } from '../../infrastructure/runners/functional-test.runner';
import { SmokeTestRunner } from '../../infrastructure/runners/smoke-test.runner';
import { ArchitectureTestRunner } from '../../infrastructure/runners/architecture-test.runner';
import { PenetrationTestRunner } from '../../infrastructure/runners/penetration-test.runner';
import { IntegrationTestRunner } from '../../infrastructure/runners/integration-test.runner';
import type { ITestTypeRunner, TestRunConfig } from '../../infrastructure/runners/test-runner.interface';

// Run order: fast checks first, expensive last
const RUN_ORDER: TestType[] = [
  TestType.SMOKE,
  TestType.UNIT,
  TestType.INTEGRATION,
  TestType.FUNCTIONAL,
  TestType.ARCHITECTURE,
  TestType.PENETRATION,
];

@Injectable()
export class TestOrchestratorService {
  private readonly logger = new Logger(TestOrchestratorService.name);
  private readonly runners: Map<TestType, ITestTypeRunner>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly unitRunner: UnitTestRunner,
    private readonly functionalRunner: FunctionalTestRunner,
    private readonly smokeRunner: SmokeTestRunner,
    private readonly architectureRunner: ArchitectureTestRunner,
    private readonly penetrationRunner: PenetrationTestRunner,
    private readonly integrationRunner: IntegrationTestRunner,
  ) {
    this.runners = new Map<TestType, ITestTypeRunner>([
      [TestType.UNIT, unitRunner as ITestTypeRunner],
      [TestType.FUNCTIONAL, functionalRunner as ITestTypeRunner],
      [TestType.SMOKE, smokeRunner as ITestTypeRunner],
      [TestType.INTEGRATION, integrationRunner as ITestTypeRunner],
      [TestType.ARCHITECTURE, architectureRunner as ITestTypeRunner],
      [TestType.PENETRATION, penetrationRunner as ITestTypeRunner],
    ]);
  }

  async runAll(testRunId: string, testTypes: TestType[], config: TestRunConfig): Promise<void> {
    const typesToRun = testTypes.length > 0 ? testTypes : Array.from(this.runners.keys());
    const runOrder = RUN_ORDER.filter(t => typesToRun.includes(t));

    const summary: Record<string, any> = {};
    let totalTests = 0, totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalErrors = 0, totalDuration = 0;
    let coveragePercent: number | undefined;

    for (let i = 0; i < runOrder.length; i++) {
      const type = runOrder[i];
      const runner = this.runners.get(type);
      if (!runner) continue;

      const progress = Math.round((i / runOrder.length) * 100);
      await this.prisma.platform.testRun.update({
        where: { id: testRunId },
        data: { progressPercent: progress, currentPhase: `Running ${type.toLowerCase()} tests...` },
      });

      this.logger.log(`TestRun ${testRunId}: starting ${type}`);
      const result = await runner.run(config);
      this.logger.log(`TestRun ${testRunId}: ${type} done — ${result.passed}/${result.total} passed`);

      // Persist individual test results
      if (result.results.length > 0) {
        await this.prisma.platform.testResult.createMany({
          data: result.results.map(r => ({
            testRunId,
            testType: type,
            suiteName: r.suiteName,
            testName: r.testName,
            filePath: r.filePath,
            module: r.module,
            status: r.status as any,
            duration: r.duration,
            errorMessage: r.errorMessage,
            errorStack: r.errorStack,
            expectedValue: r.expectedValue,
            actualValue: r.actualValue,
          })),
        });
      }

      totalTests += result.total;
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalSkipped += result.skipped;
      totalErrors += result.errors;
      totalDuration += result.duration;

      if (result.coveragePercent !== undefined) coveragePercent = result.coveragePercent;

      summary[type] = {
        total: result.total,
        passed: result.passed,
        failed: result.failed,
        skipped: result.skipped,
        errors: result.errors,
        duration: result.duration,
      };
    }

    const finalStatus = totalFailed > 0 || totalErrors > 0 ? 'FAILED' : 'COMPLETED';
    await this.prisma.platform.testRun.update({
      where: { id: testRunId },
      data: {
        status: finalStatus,
        progressPercent: 100,
        currentPhase: totalFailed > 0 ? `${totalFailed} tests failed` : 'All tests passed',
        totalTests,
        passed: totalPassed,
        failed: totalFailed,
        skipped: totalSkipped,
        errors: totalErrors,
        duration: totalDuration,
        summary,
        coveragePercent,
        completedAt: new Date(),
      },
    });

    this.logger.log(`TestRun ${testRunId}: ${finalStatus} — ${totalPassed}/${totalTests} passed`);
  }
}
