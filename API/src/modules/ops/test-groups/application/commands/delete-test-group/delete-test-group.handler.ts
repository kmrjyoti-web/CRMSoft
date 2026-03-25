import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { DeleteTestGroupCommand } from './delete-test-group.command';
import { TEST_GROUP_REPOSITORY, ITestGroupRepository } from '../../../infrastructure/repositories/test-group.repository';

@CommandHandler(DeleteTestGroupCommand)
export class DeleteTestGroupHandler implements ICommandHandler<DeleteTestGroupCommand> {
  constructor(
    @Inject(TEST_GROUP_REPOSITORY)
    private readonly repo: ITestGroupRepository,
  ) {}

  async execute(cmd: DeleteTestGroupCommand): Promise<{ success: boolean }> {
    const group = await this.repo.findById(cmd.id);
    if (!group) throw new NotFoundException(`TestGroup not found: ${cmd.id}`);
    if (group.isSystem) throw new BadRequestException('System test groups cannot be deleted');

    await this.repo.softDelete(cmd.id);
    return { success: true };
  }
}
