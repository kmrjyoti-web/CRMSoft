import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { DeleteScheduledTestCommand } from './delete-scheduled-test.command';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@CommandHandler(DeleteScheduledTestCommand)
export class DeleteScheduledTestHandler implements ICommandHandler<DeleteScheduledTestCommand> {
  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(cmd: DeleteScheduledTestCommand): Promise<void> {
    const existing = await this.repo.findById(cmd.id);
    if (!existing || existing.tenantId !== cmd.tenantId) {
      throw new NotFoundException('Scheduled test not found');
    }
    await this.repo.softDelete(cmd.id);
  }
}
