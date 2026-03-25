import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateManualTestLogCommand } from './update-manual-test-log.command';
import { MANUAL_TEST_LOG_REPOSITORY, IManualTestLogRepository } from '../../../infrastructure/repositories/manual-test-log.repository';

@CommandHandler(UpdateManualTestLogCommand)
export class UpdateManualTestLogHandler implements ICommandHandler<UpdateManualTestLogCommand> {
  constructor(
    @Inject(MANUAL_TEST_LOG_REPOSITORY)
    private readonly repo: IManualTestLogRepository,
  ) {}

  async execute(cmd: UpdateManualTestLogCommand): Promise<any> {
    const existing = await this.repo.findById(cmd.id);
    if (!existing) throw new NotFoundException(`ManualTestLog not found: ${cmd.id}`);
    return this.repo.update(cmd.id, cmd.dto);
  }
}
