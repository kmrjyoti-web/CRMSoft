// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CancelTourPlanCommand } from './cancel-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelTourPlanCommand)
export class CancelTourPlanHandler implements ICommandHandler<CancelTourPlanCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelTourPlanCommand) {
    const existing = await this.prisma.tourPlan.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Tour plan not found');
    if (existing.status === 'COMPLETED' || existing.status === 'CANCELLED') {
      throw new BadRequestException('Cannot cancel a completed or already cancelled tour plan');
    }

    const tourPlan = await this.prisma.tourPlan.update({
      where: { id: cmd.id },
      data: { status: 'CANCELLED' },
      include: { lead: true, salesPerson: true },
    });

    await this.prisma.calendarEvent.updateMany({
      where: { eventType: 'TOUR_PLAN', sourceId: cmd.id },
      data: { isActive: false },
    });

    return tourPlan;
  }
}
