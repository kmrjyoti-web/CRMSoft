import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTestGroupCommand } from './update-test-group.command';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@CommandHandler(UpdateTestGroupCommand)
export class UpdateTestGroupHandler implements ICommandHandler<UpdateTestGroupCommand> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(cmd: UpdateTestGroupCommand): Promise<any> {
    const existing = await this.repo.findById(cmd.id);
    if (!existing) throw new NotFoundException(`TestGroup not found: ${cmd.id}`);

    return this.repo.update(cmd.id, cmd.dto as any);
  }
}
