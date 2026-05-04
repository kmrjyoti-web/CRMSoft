// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTourPlanCommand } from './create-tour-plan.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';

@CommandHandler(CreateTourPlanCommand)
export class CreateTourPlanHandler implements ICommandHandler<CreateTourPlanCommand> {
    private readonly logger = new Logger(CreateTourPlanHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateTourPlanCommand) {
    try {
      const tourPlan = await this.prisma.working.tourPlan.create({
        data: {
          title: cmd.title,
          description: cmd.description,
          planDate: cmd.planDate,
          startLocation: cmd.startLocation,
          endLocation: cmd.endLocation,
          leadId: cmd.leadId,
          salesPersonId: cmd.userId,
          visits: cmd.visits?.length ? {
            create: cmd.visits.map((v, i) => ({
              leadId: v.leadId,
              contactId: v.contactId,
              scheduledTime: v.scheduledTime,
              sortOrder: v.sortOrder ?? i,
            })),
          } : undefined,
        },
        include: { lead: true, salesPerson: true, visits: true },
      });

      await createAutoReminder(this.prisma, {
        entityType: 'TOUR_PLAN',
        entityId: tourPlan.id,
        eventDate: cmd.planDate,
        title: cmd.title,
        recipientId: cmd.userId,
        createdById: cmd.userId,
      });

      const existingEvent = await this.prisma.working.calendarEvent.findFirst({
        where: { eventType: 'TOUR_PLAN', sourceId: tourPlan.id },
      });
      if (existingEvent) {
        await this.prisma.working.calendarEvent.update({
          where: { id: existingEvent.id },
          data: { title: cmd.title, startTime: cmd.planDate },
        });
      } else {
        await this.prisma.working.calendarEvent.create({
          data: {
            eventType: 'TOUR_PLAN',
            sourceId: tourPlan.id,
            title: cmd.title,
            description: cmd.description,
            startTime: cmd.planDate,
            allDay: true,
            color: CALENDAR_COLORS.TOUR,
            userId: cmd.userId,
          },
        });
      }

      return tourPlan;
    } catch (error) {
      this.logger.error(`CreateTourPlanHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
