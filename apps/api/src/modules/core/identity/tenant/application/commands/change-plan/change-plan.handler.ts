import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger, NotFoundException } from '@nestjs/common';
import { ChangePlanCommand } from './change-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(ChangePlanCommand)
export class ChangePlanHandler implements ICommandHandler<ChangePlanCommand> {
  private readonly logger = new Logger(ChangePlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ChangePlanCommand) {
    try {
      const activeSubscription = await this.prisma.identity.subscription.findFirst({
        where: {
          tenantId: command.tenantId,
          status: { in: ['ACTIVE', 'TRIALING'] },
        },
      });

      if (!activeSubscription) {
        throw new NotFoundException(
          `No active subscription found for tenant ${command.tenantId}`,
        );
      }

      const updated = await this.prisma.identity.subscription.update({
        where: { id: activeSubscription.id },
        data: { planId: command.newPlanId },
      });

      this.logger.log(
        `Plan changed for tenant ${command.tenantId}: ${activeSubscription.planId} -> ${command.newPlanId}`,
      );
      return updated;
    } catch (error) {
      this.logger.error(`ChangePlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
