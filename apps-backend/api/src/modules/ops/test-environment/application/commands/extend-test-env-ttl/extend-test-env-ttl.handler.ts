import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException, Logger } from '@nestjs/common';
import { ExtendTestEnvTtlCommand } from './extend-test-env-ttl.command';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../../infrastructure/repositories/test-env.repository';

const MAX_EXTENSION_HOURS = 168; // 7 days

@CommandHandler(ExtendTestEnvTtlCommand)
export class ExtendTestEnvTtlHandler implements ICommandHandler<ExtendTestEnvTtlCommand> {
    private readonly logger = new Logger(ExtendTestEnvTtlHandler.name);

  constructor(
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
  ) {}

  async execute(cmd: ExtendTestEnvTtlCommand): Promise<{ expiresAt: Date }> {
    try {
      const { testEnvId, additionalHours } = cmd;

      if (additionalHours < 1 || additionalHours > MAX_EXTENSION_HOURS) {
        throw new BadRequestException(
          `additionalHours must be between 1 and ${MAX_EXTENSION_HOURS}`,
        );
      }

      const testEnv = await this.repo.findById(testEnvId);
      if (!testEnv) throw new NotFoundException(`TestEnvironment ${testEnvId} not found`);

      if (['CLEANED', 'CLEANING', 'FAILED'].includes(testEnv.status)) {
        throw new BadRequestException(
          `Cannot extend TTL for a test environment with status: ${testEnv.status}`,
        );
      }

      const currentExpiry = testEnv.expiresAt ?? new Date();
      const newExpiry = new Date(currentExpiry.getTime() + additionalHours * 60 * 60 * 1000);

      await this.repo.update(testEnvId, {
        expiresAt: newExpiry,
        statusMessage: `TTL extended by ${additionalHours}h — expires at ${newExpiry.toISOString()}`,
      });

      return { expiresAt: newExpiry };
    } catch (error) {
      this.logger.error(`ExtendTestEnvTtlHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
