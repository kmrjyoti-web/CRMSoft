import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateTourPlanCommand } from './update-tour-plan.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTourPlanCommand)
export class UpdateTourPlanHandler implements ICommandHandler<UpdateTourPlanCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTourPlanCommand) {
    const existing = await this.prisma.tourPlan.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Tour plan not found');
    if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
      throw new BadRequestException('Can only edit tour plans in DRAFT or REJECTED status');
    }

    const tourPlan = await this.prisma.tourPlan.update({
      where: { id: cmd.id },
      data: cmd.data as any,
      include: { lead: true, salesPerson: true, visits: true },
    });

    if (cmd.data.planDate) {
      await this.prisma.calendarEvent.updateMany({
        where: { eventType: 'TOUR_PLAN', sourceId: cmd.id },
        data: { startTime: cmd.data.planDate, title: cmd.data.title || existing.title },
      });
    }

    return tourPlan;
  }
}
