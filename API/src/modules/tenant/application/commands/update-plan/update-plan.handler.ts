import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { FeatureFlag } from '@prisma/client';
import { UpdatePlanCommand } from './update-plan.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdatePlanCommand)
export class UpdatePlanHandler implements ICommandHandler<UpdatePlanCommand> {
  private readonly logger = new Logger(UpdatePlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: UpdatePlanCommand) {
    const plan = await this.prisma.plan.update({
      where: { id: command.planId },
      data: {
        ...(command.name !== undefined && { name: command.name }),
        ...(command.description !== undefined && { description: command.description }),
        ...(command.price !== undefined && { price: command.price }),
        ...(command.maxUsers !== undefined && { maxUsers: command.maxUsers }),
        ...(command.maxContacts !== undefined && { maxContacts: command.maxContacts }),
        ...(command.maxLeads !== undefined && { maxLeads: command.maxLeads }),
        ...(command.maxProducts !== undefined && { maxProducts: command.maxProducts }),
        ...(command.maxStorage !== undefined && { maxStorage: command.maxStorage }),
        ...(command.features !== undefined && { features: command.features as FeatureFlag[] }),
        ...(command.isActive !== undefined && { isActive: command.isActive }),
        ...(command.sortOrder !== undefined && { sortOrder: command.sortOrder }),
      },
    });

    this.logger.log(`Plan updated: ${plan.id}`);
    return plan;
  }
}
