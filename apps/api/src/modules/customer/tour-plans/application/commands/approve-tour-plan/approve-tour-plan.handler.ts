// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ApproveTourPlanCommand } from './approve-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ApproveTourPlanCommand)
export class ApproveTourPlanHandler implements ICommandHandler<ApproveTourPlanCommand> {
    private readonly logger = new Logger(ApproveTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ApproveTourPlanCommand) {
    try {
      const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Tour plan not found');
      if (existing.status !== 'PENDING_APPROVAL') {
        throw new BadRequestException('Tour plan is not pending approval');
      }

      return this.prisma.working.tourPlan.update({
        where: { id: cmd.id },
        data: {
          status: 'APPROVED',
          approvedById: cmd.userId,
          approvedAt: new Date(),
        },
        include: { lead: true, salesPerson: true },
      });
    } catch (error) {
      this.logger.error(`ApproveTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
