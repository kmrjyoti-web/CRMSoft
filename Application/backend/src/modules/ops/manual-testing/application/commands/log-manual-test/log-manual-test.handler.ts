import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { LogManualTestCommand } from './log-manual-test.command';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@CommandHandler(LogManualTestCommand)
export class LogManualTestHandler implements ICommandHandler<LogManualTestCommand> {
  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(cmd: LogManualTestCommand): Promise<any> {
    const { tenantId, userId, dto } = cmd;
    return this.repo.create({ tenantId, userId, ...dto });
  }
}
