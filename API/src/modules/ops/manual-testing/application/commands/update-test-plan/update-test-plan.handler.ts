import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException } from '@nestjs/common';
import { UpdateTestPlanCommand } from './update-test-plan.command';
import { TEST_PLAN_REPOSITORY, ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';

@CommandHandler(UpdateTestPlanCommand)
export class UpdateTestPlanHandler implements ICommandHandler<UpdateTestPlanCommand> {
  constructor(
    @Inject(TEST_PLAN_REPOSITORY)
    private readonly repo: ITestPlanRepository,
  ) {}

  async execute(cmd: UpdateTestPlanCommand): Promise<any> {
    const existing = await this.repo.findById(cmd.id);
    if (!existing || existing.tenantId !== cmd.tenantId) {
      throw new NotFoundException('Test plan not found');
    }

    const updates: Record<string, any> = {};
    if (cmd.name !== undefined) updates.name = cmd.name;
    if (cmd.description !== undefined) updates.description = cmd.description;
    if (cmd.version !== undefined) updates.version = cmd.version;
    if (cmd.targetModules !== undefined) updates.targetModules = cmd.targetModules;
    if (cmd.status !== undefined) updates.status = cmd.status;

    return this.repo.update(cmd.id, updates as any);
  }
}
