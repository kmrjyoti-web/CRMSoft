import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { CreateTestPlanCommand } from './create-test-plan.command';
import { TEST_PLAN_REPOSITORY, ITestPlanRepository } from '../../../infrastructure/repositories/test-plan.repository';

@CommandHandler(CreateTestPlanCommand)
export class CreateTestPlanHandler implements ICommandHandler<CreateTestPlanCommand> {
    private readonly logger = new Logger(CreateTestPlanHandler.name);

  constructor(
    @Inject(TEST_PLAN_REPOSITORY)
    private readonly repo: ITestPlanRepository,
  ) {}

  async execute(cmd: CreateTestPlanCommand): Promise<Record<string, unknown>> {
    try {
      const plan = await this.repo.create({
        tenantId: cmd.tenantId,
        name: cmd.name,
        description: cmd.description,
        version: cmd.version,
        targetModules: cmd.targetModules,
        createdById: cmd.userId,
      });

      if (cmd.items.length > 0) {
        for (let i = 0; i < cmd.items.length; i++) {
          await this.repo.createItem({ planId: plan.id, ...cmd.items[i], sortOrder: i });
        }
        await this.repo.recalcStats(plan.id);
        return this.repo.findById(plan.id);
      }

      return plan;
    } catch (error) {
      this.logger.error(`CreateTestPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
