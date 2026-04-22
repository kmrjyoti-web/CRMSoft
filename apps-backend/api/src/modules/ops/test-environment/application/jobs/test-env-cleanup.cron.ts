import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../../infrastructure/db-operations.service';

@Injectable()
export class TestEnvCleanupCron {
  private readonly logger = new Logger(TestEnvCleanupCron.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
    private readonly dbOps: DbOperationsService,
  ) {}

  /** Every hour: find expired test environments and drop their databases. */
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredEnvironments(): Promise<void> {
    const expired = await this.repo.findExpired();

    if (expired.length === 0) return;

    this.logger.log(`Auto-cleanup: ${expired.length} expired test environment(s)`);

    for (const env of expired) {
      try {
        await this.repo.update(env.id, {
          status: 'CLEANING',
          statusMessage: 'Auto-cleaning (TTL expired)',
        });

        await this.dbOps.dropDatabase(env.testDbName);

        await this.repo.update(env.id, {
          status: 'CLEANED',
          statusMessage: 'Auto-cleaned (TTL expired)',
          cleanedAt: new Date(),
        });

        this.logger.log(`Auto-cleaned: ${env.name} (${env.testDbName})`);
      } catch (err: any) {
        this.logger.error(`Auto-cleanup failed for ${env.name}: ${err.message}`);
        await this.repo.update(env.id, {
          status: 'FAILED',
          statusMessage: `Auto-cleanup failed: ${err.message}`,
          errorMessage: err.message,
        });
      }
    }
  }
}
