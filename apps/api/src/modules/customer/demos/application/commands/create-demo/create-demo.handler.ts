// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateDemoCommand } from './create-demo.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';

@CommandHandler(CreateDemoCommand)
export class CreateDemoHandler implements ICommandHandler<CreateDemoCommand> {
    private readonly logger = new Logger(CreateDemoHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateDemoCommand) {
    try {
      const demo = await this.prisma.working.demo.create({
        data: {
          mode: cmd.mode as any,
          scheduledAt: cmd.scheduledAt,
          duration: cmd.duration,
          meetingLink: cmd.meetingLink,
          location: cmd.location,
          notes: cmd.notes,
          leadId: cmd.leadId,
          conductedById: cmd.userId,
        },
        include: { lead: true, conductedBy: true },
      });

      await createAutoReminder(this.prisma, {
        entityType: 'DEMO',
        entityId: demo.id,
        eventDate: cmd.scheduledAt,
        title: `Demo with ${demo.lead?.leadNumber || 'Lead'}`,
        recipientId: cmd.userId,
        createdById: cmd.userId,
      });

      const existingEvent = await this.prisma.working.calendarEvent.findFirst({
        where: { eventType: 'DEMO', sourceId: demo.id },
      });
      if (existingEvent) {
        await this.prisma.working.calendarEvent.update({
          where: { id: existingEvent.id },
          data: { startTime: cmd.scheduledAt },
        });
      } else {
        await this.prisma.working.calendarEvent.create({
          data: {
            eventType: 'DEMO',
            sourceId: demo.id,
            title: `Demo: ${demo.lead?.leadNumber || 'Lead'}`,
            startTime: cmd.scheduledAt,
            endTime: cmd.duration ? new Date(cmd.scheduledAt.getTime() + cmd.duration * 60000) : undefined,
            color: CALENDAR_COLORS.DEMO,
            userId: cmd.userId,
          },
        });
      }

      return demo;
    } catch (error) {
      this.logger.error(`CreateDemoHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
