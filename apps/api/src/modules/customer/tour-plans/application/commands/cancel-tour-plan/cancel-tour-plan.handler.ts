// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CancelTourPlanCommand } from './cancel-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelTourPlanCommand)
export class CancelTourPlanHandler implements ICommandHandler<CancelTourPlanCommand> {
    private readonly logger = new Logger(CancelTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelTourPlanCommand) {
    try {
      const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Tour plan not found');
      if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
        throw new BadRequestException('Cannot cancel a completed or already cancelled tour plan');
      }

      const tourPlan = await this.prisma.working.tourPlan.update({
        where: { id: cmd.id },
        data: { status: 'CANCELLED' },
        include: { lead: true, salesPerson: true },
      });

      await this.prisma.working.calendarEvent.updateMany({
        where: { eventType: 'TOUR_PLAN', sourceId: cmd.id },
        data: { isActive: false },
      });

      return tourPlan;
    } catch (error) {
      this.logger.error(`CancelTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
