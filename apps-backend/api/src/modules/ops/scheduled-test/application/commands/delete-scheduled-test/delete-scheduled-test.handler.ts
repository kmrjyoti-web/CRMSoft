import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { DeleteScheduledTestCommand } from './delete-scheduled-test.command';
import {
  SCHEDULED_TEST_REPOSITORY,
  IScheduledTestRepository,
} from '../../../infrastructure/repositories/scheduled-test.repository';

@CommandHandler(DeleteScheduledTestCommand)
export class DeleteScheduledTestHandler implements ICommandHandler<DeleteScheduledTestCommand> {
    private readonly logger = new Logger(DeleteScheduledTestHandler.name);

  constructor(
    @Inject(SCHEDULED_TEST_REPOSITORY)
    private readonly repo: IScheduledTestRepository,
  ) {}

  async execute(cmd: DeleteScheduledTestCommand): Promise<void> {
    try {
      const existing = await this.repo.findById(cmd.id);
      if (!existing || existing.tenantId !== cmd.tenantId) {
        throw new NotFoundException('Scheduled test not found');
      }
      await this.repo.softDelete(cmd.id);
    } catch (error) {
      this.logger.error(`DeleteScheduledTestHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
