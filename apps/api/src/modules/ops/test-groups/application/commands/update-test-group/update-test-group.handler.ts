import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateTestGroupCommand } from './update-test-group.command';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@CommandHandler(UpdateTestGroupCommand)
export class UpdateTestGroupHandler implements ICommandHandler<UpdateTestGroupCommand> {
    private readonly logger = new Logger(UpdateTestGroupHandler.name);

  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(cmd: UpdateTestGroupCommand): Promise<Record<string, unknown>> {
    try {
      const existing = await this.repo.findById(cmd.id);
      if (!existing) throw new NotFoundException(`TestGroup not found: ${cmd.id}`);

      return this.repo.update(cmd.id, cmd.dto as any);
    } catch (error) {
      this.logger.error(`UpdateTestGroupHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
