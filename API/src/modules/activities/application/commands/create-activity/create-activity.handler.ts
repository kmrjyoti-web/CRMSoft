import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateActivityCommand } from './create-activity.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../common/utils/reminder.utils';
import { CALENDAR_COLORS } from '../../../../../common/utils/calendar-colors';

@CommandHandler(CreateActivityCommand)
export class CreateActivityHandler implements ICommandHandler<CreateActivityCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateActivityCommand) {
    const activity = await this.prisma.activity.create({
      data: {
        type: cmd.type as any,
        subject: cmd.subject,
        description: cmd.description,
        scheduledAt: cmd.scheduledAt,
        endTime: cmd.endTime,
        duration: cmd.duration,
        leadId: cmd.leadId,
        contactId: cmd.contactId,
        locationName: cmd.locationName,
        latitude: cmd.latitude,
        longitude: cmd.longitude,
        createdById: cmd.userId,
      },
      include: { lead: true, contact: true, createdByUser: true },
    });

    if (cmd.scheduledAt) {
      await createAutoReminder(this.prisma, {
        entityType: 'ACTIVITY',
        entityId: activity.id,
        eventDate: new Date(cmd.scheduledAt),
        title: cmd.subject,
        recipientId: cmd.userId,
        createdById: cmd.userId,
      });

      const existingEvent = await this.prisma.calendarEvent.findFirst({
        where: { eventType: 'ACTIVITY', sourceId: activity.id },
      });
      if (existingEvent) {
        await this.prisma.calendarEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: cmd.subject,
            startTime: new Date(cmd.scheduledAt),
            endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
          },
        });
      } else {
        await this.prisma.calendarEvent.create({
          data: {
            eventType: 'ACTIVITY',
            sourceId: activity.id,
            title: cmd.subject,
            description: cmd.description,
            startTime: new Date(cmd.scheduledAt),
            endTime: cmd.endTime ? new Date(cmd.endTime) : undefined,
            color: CALENDAR_COLORS[cmd.type] || CALENDAR_COLORS.CALL,
            userId: cmd.userId,
          },
        });
      }
    }

    return activity;
  }
}
