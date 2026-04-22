import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PlatformConsolePrismaService } from '../prisma/platform-console-prisma.service';
import { TestRunnerService } from './test-runner.service';
import { TestCoverageService } from './test-coverage.service';

@Injectable()
export class TestScheduleCron {
  private readonly logger = new Logger(TestScheduleCron.name);

  constructor(
    private readonly db: PlatformConsolePrismaService,
    private readonly testRunner: TestRunnerService,
    private readonly coverageService: TestCoverageService,
  ) {}

  @Cron('* * * * *', { name: 'test-schedule-check', timeZone: 'Asia/Kolkata' })
  async checkSchedules() {
    try {
      const now = new Date();
      const dueSchedules = await this.db.pcTestSchedule.findMany({
        where: {
          isActive: true,
          nextRun: { lte: now },
        },
      });

      for (const schedule of dueSchedules) {
        try {
          this.logger.log(`Triggering scheduled test run: ${schedule.id} (${schedule.scheduleType})`);

          await this.testRunner.runTests({
            moduleScope: schedule.moduleScope || undefined,
            verticalScope: schedule.verticalScope || undefined,
            planId: schedule.planId || undefined,
            triggerType: 'SCHEDULED',
          });

          await this.db.pcTestSchedule.update({
            where: { id: schedule.id },
            data: {
              lastRun: now,
              nextRun: null,
            },
          });
        } catch (scheduleError) {
          this.logger.error(
            `Failed to execute schedule ${schedule.id}`,
            (scheduleError as Error).stack,
          );
        }
      }
    } catch (error) {
      this.logger.error('Failed to check test schedules', (error as Error).stack);
    }
  }

  @Cron('30 17 * * *', { name: 'nightly-test-run', timeZone: 'Asia/Kolkata' })
  async nightlyTestRun() {
    try {
      this.logger.log('Starting nightly test run');
      const execution = await this.testRunner.runTests({ triggerType: 'SCHEDULED' });
      this.logger.log(`Nightly test run started: ${execution.id}`);
    } catch (error) {
      this.logger.error('Nightly test run failed', (error as Error).stack);
    }
  }

  @Cron('30 2 * * 0', { name: 'weekly-coverage', timeZone: 'Asia/Kolkata' })
  async weeklyCoverageRefresh() {
    try {
      this.logger.log('Starting weekly coverage refresh');
      const results = await this.coverageService.refreshCoverage();
      this.logger.log(`Weekly coverage refresh completed: ${results.length} modules`);
    } catch (error) {
      this.logger.error('Weekly coverage refresh failed', (error as Error).stack);
    }
  }
}
