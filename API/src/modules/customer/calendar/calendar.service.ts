// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  async getCalendarEvents(tenantId: string, userId: string, startDate: Date, endDate: Date, eventTypes?: string[]) {
    const where: any = {
      tenantId,
      userId,
      isActive: true,
      startTime: { gte: startDate, lte: endDate },
    };
    if (eventTypes?.length) where.eventType = { in: eventTypes };

    return this.prisma.working.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
    });
  }

  async getTeamCalendar(tenantId: string, userIds: string[], startDate: Date, endDate: Date) {
    return this.prisma.working.calendarEvent.findMany({
      where: {
        tenantId,
        userId: { in: userIds },
        isActive: true,
        startTime: { gte: startDate, lte: endDate },
      },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async getAvailability(tenantId: string, userId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const events = await this.prisma.working.calendarEvent.findMany({
      where: {
        tenantId,
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

  async getDayView(tenantId: string, userId: string, date: Date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    return this.getCalendarEvents(tenantId, userId, dayStart, dayEnd);
  }

  async getWeekView(tenantId: string, userId: string, date: Date) {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    return this.getCalendarEvents(tenantId, userId, weekStart, weekEnd);
  }

  async getMonthView(tenantId: string, userId: string, year: number, month: number) {
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    return this.getCalendarEvents(tenantId, userId, monthStart, monthEnd);
  }
}
