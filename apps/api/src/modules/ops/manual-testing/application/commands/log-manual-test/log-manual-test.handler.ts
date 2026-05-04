import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { LogManualTestCommand } from './log-manual-test.command';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@CommandHandler(LogManualTestCommand)
export class LogManualTestHandler implements ICommandHandler<LogManualTestCommand> {
    private readonly logger = new Logger(LogManualTestHandler.name);

  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(cmd: LogManualTestCommand): Promise<Record<string, unknown>> {
    try {
      const { tenantId, userId, dto } = cmd;
      return this.repo.create({ tenantId, userId, ...dto });
    } catch (error) {
      this.logger.error(`LogManualTestHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
