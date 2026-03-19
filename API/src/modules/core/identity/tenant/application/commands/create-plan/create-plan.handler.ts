import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PlanInterval, FeatureFlag } from '@prisma/identity-client';
import { CreatePlanCommand } from './create-plan.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(CreatePlanCommand)
export class CreatePlanHandler implements ICommandHandler<CreatePlanCommand> {
  private readonly logger = new Logger(CreatePlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: CreatePlanCommand) {
    const plan = await this.prisma.plan.create({
      data: {
        name: command.name,
        code: command.code,
        description: command.description,
        interval: command.interval as PlanInterval,
        price: command.price,
        currency: command.currency ?? 'INR',
        maxUsers: command.maxUsers,
        maxContacts: command.maxContacts,
        maxLeads: command.maxLeads,
        maxProducts: command.maxProducts,
        maxStorage: command.maxStorage,
        features: command.features as FeatureFlag[],
        isActive: command.isActive ?? true,
        sortOrder: command.sortOrder ?? 0,
      },
    });

    this.logger.log(`Plan created: ${plan.id} (${plan.name})`);
    return plan;
  }
}
