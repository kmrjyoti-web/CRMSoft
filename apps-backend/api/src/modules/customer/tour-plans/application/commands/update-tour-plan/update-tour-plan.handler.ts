// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { UpdateTourPlanCommand } from './update-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateTourPlanCommand)
export class UpdateTourPlanHandler implements ICommandHandler<UpdateTourPlanCommand> {
    private readonly logger = new Logger(UpdateTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTourPlanCommand) {
    try {
      const existing = await this.prisma.working.tourPlan.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Tour plan not found');
      if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
        throw new BadRequestException('Can only edit tour plans in DRAFT or REJECTED status');
      }

      const tourPlan = await this.prisma.working.tourPlan.update({
        where: { id: cmd.id },
        data: cmd.data as any,
        include: { lead: true, salesPerson: true, visits: true },
      });

      if (cmd.data.planDate) {
        await this.prisma.working.calendarEvent.updateMany({
          where: { eventType: 'TOUR_PLAN', sourceId: cmd.id },
          data: { startTime: cmd.data.planDate, title: cmd.data.title || existing.title },
        });
      }

      return tourPlan;
    } catch (error) {
      this.logger.error(`UpdateTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
