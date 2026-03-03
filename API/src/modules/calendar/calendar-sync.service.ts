import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { CalendarEventInput } from '../../common/interfaces/calendar-event.interface';

@Injectable()
export class CalendarSyncService {
  constructor(private readonly prisma: PrismaService) {}

  async syncEvent(input: CalendarEventInput) {
    const existing = await this.prisma.calendarEvent.findFirst({
      where: { eventType: input.eventType, sourceId: input.sourceId },
    });
    if (existing) {
      return this.prisma.calendarEvent.update({
        where: { id: existing.id },
        data: {
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay || false,
          color: input.color,
        },
      });
    } else {
      return this.prisma.calendarEvent.create({
        data: {
          eventType: input.eventType,
          sourceId: input.sourceId,
          title: input.title,
          description: input.description,
          startTime: input.startTime,
          endTime: input.endTime,
          allDay: input.allDay || false,
          color: input.color,
          userId: input.userId,
        },
      });
    }
  }

  async removeEvent(eventType: string, sourceId: string) {
    await this.prisma.calendarEvent.updateMany({
      where: { eventType, sourceId },
      data: { isActive: false },
    });
  }
}
