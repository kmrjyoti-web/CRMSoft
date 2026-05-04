import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { DeactivatePlanCommand } from './deactivate-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(DeactivatePlanCommand)
export class DeactivatePlanHandler implements ICommandHandler<DeactivatePlanCommand> {
  private readonly logger = new Logger(DeactivatePlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivatePlanCommand) {
    try {
      const plan = await this.prisma.identity.plan.update({
        where: { id: command.planId },
        data: { isActive: false },
      });

      this.logger.log(`Plan deactivated: ${plan.id}`);
      return plan;
    } catch (error) {
      this.logger.error(`DeactivatePlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
