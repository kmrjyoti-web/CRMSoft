import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import { CleanupTestEnvCommand } from './cleanup-test-env.command';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';
import { DbOperationsService } from '../../../infrastructure/db-operations.service';

@CommandHandler(CleanupTestEnvCommand)
export class CleanupTestEnvHandler implements ICommandHandler<CleanupTestEnvCommand> {
  private readonly logger = new Logger(CleanupTestEnvHandler.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
    private readonly dbOps: DbOperationsService,
  ) {}

  async execute(cmd: CleanupTestEnvCommand): Promise<{ cleaned: boolean }> {
    const testEnv = await this.repo.findById(cmd.testEnvId);
    if (!testEnv) throw new NotFoundException(`TestEnvironment ${cmd.testEnvId} not found`);

    // Already cleaned — idempotent
    if (testEnv.status === 'CLEANED' || testEnv.status === 'CLEANING') {
      return { cleaned: true };
    }

    await this.repo.update(testEnv.id, {
      status: 'CLEANING',
      statusMessage: 'Dropping test database...',
    });

    try {
      await this.dbOps.dropDatabase(testEnv.testDbName);
      await this.repo.update(testEnv.id, {
        status: 'CLEANED',
        statusMessage: 'Test environment cleaned up',
        cleanedAt: new Date(),
      });
      this.logger.log(`TestEnvironment cleaned: ${testEnv.testDbName}`);
      return { cleaned: true };
    } catch (err: any) {
      await this.repo.update(testEnv.id, {
        status: 'FAILED',
        statusMessage: `Cleanup failed: ${err.message}`,
        errorMessage: err.message,
      });
      throw err;
    }
  }
}
