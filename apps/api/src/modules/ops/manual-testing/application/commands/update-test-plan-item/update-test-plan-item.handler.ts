import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, NotFoundException, Logger } from '@nestjs/common';
import { UpdateTestPlanItemCommand } from './update-test-plan-item.command';
import { TEST_PLAN_REPOSITORY, ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';

@CommandHandler(UpdateTestPlanItemCommand)
export class UpdateTestPlanItemHandler implements ICommandHandler<UpdateTestPlanItemCommand> {
    private readonly logger = new Logger(UpdateTestPlanItemHandler.name);

  constructor(
    @Inject(TEST_PLAN_REPOSITORY)
    private readonly repo: ITestPlanRepository,
  ) {}

  async execute(cmd: UpdateTestPlanItemCommand): Promise<Record<string, unknown>> {
    try {
      const item = await this.repo.findItemById(cmd.itemId);
      if (!item || item.planId !== cmd.planId) {
        throw new NotFoundException('Test plan item not found');
      }

      const updates: Record<string, any> = {};
      if (cmd.status !== undefined) {
        updates.status = cmd.status;
        updates.testedById = cmd.userId;
        updates.testedAt = new Date();
      }
      if (cmd.notes !== undefined) updates.notes = cmd.notes;
      if (cmd.errorDetails !== undefined) updates.errorDetails = cmd.errorDetails;
      if (cmd.priority !== undefined) updates.priority = cmd.priority;
      if (cmd.moduleName !== undefined) updates.moduleName = cmd.moduleName;
      if (cmd.componentName !== undefined) updates.componentName = cmd.componentName;
      if (cmd.functionality !== undefined) updates.functionality = cmd.functionality;
      if (cmd.layer !== undefined) updates.layer = cmd.layer;

      const updated = await this.repo.updateItem(cmd.itemId, updates as any);
      // Recalc plan stats after item status change
      if (cmd.status !== undefined) {
        await this.repo.recalcStats(cmd.planId);
      }
      return updated;
    } catch (error) {
      this.logger.error(`UpdateTestPlanItemHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
