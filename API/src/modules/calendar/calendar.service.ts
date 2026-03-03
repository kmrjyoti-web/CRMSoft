import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarEvents(userId: string, startDate: Date, endDate: Date, eventTypes?: string[]) {
    const where: any = {
      userId,
      isActive: true,
      startTime: { gte: startDate, lte: endDate },
    };
    if (eventTypes?.length) where.eventType = { in: eventTypes };

    return this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  async getTeamCalendar(userIds: string[], startDate: Date, endDate: Date) {
    return this.prisma.calendarEvent.findMany({
      where: {
        userId: { in: userIds },
        isActive: true,
        startTime: { gte: startDate, lte: endDate },
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAvailability(userId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        userId,
        isActive: true,
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: 'asc' },
      select: { startTime: true, endTime: true, title: true },
    });

    const busySlots = events.map((e) => ({
      start: e.startTime,
      end: e.endTime || new Date(e.startTime.getTime() + 60 * 60 * 1000),
      title: e.title,
    }));

    return { date, busySlots, totalEvents: events.length };
  }

  async getDayView(userId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    return this.getCalendarEvents(userId, dayStart, dayEnd);
  }

  async getWeekView(userId: string, date: Date) {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return this.getCalendarEvents(userId, weekStart, weekEnd);
  }

  async getMonthView(userId: string, year: number, month: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getCalendarEvents(userId, monthStart, monthEnd);
  }
}
