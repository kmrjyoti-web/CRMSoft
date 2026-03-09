import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

interface WorkingHourEntry {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isWorkingDay?: boolean;
}

interface TimeRange {
  start: Date;
  end: Date;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------------------------------------------------------------------ */
  /*  Working Hours                                                      */
  /* ------------------------------------------------------------------ */

  /** Set working hours for a user (upsert per dayOfWeek). */
  async setWorkingHours(
    userId: string,
    tenantId: string,
    hours: WorkingHourEntry[],
    timezone?: string,
  ) {
    const results = await this.prisma.$transaction(
      hours.map((h) =>
        this.prisma.userAvailability.upsert({
          where: {
            tenantId_userId_dayOfWeek: {
              tenantId,
              userId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            startTime: h.startTime,
            endTime: h.endTime,
            isWorkingDay: h.isWorkingDay ?? true,
            ...(timezone ? { timezone } : {}),
          },
          create: {
            tenantId,
            userId,
            dayOfWeek: h.dayOfWeek,
            startTime: h.startTime,
            endTime: h.endTime,
            isWorkingDay: h.isWorkingDay ?? true,
            timezone: timezone ?? 'Asia/Kolkata',
          },
        }),
      ),
    );
    return results;
  }

  /** Get working hours for a user (all 7 days, ordered). */
  async getWorkingHours(userId: string, tenantId: string) {
    return this.prisma.userAvailability.findMany({
      where: { tenantId, userId, isActive: true },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Blocked Slots                                                      */
  /* ------------------------------------------------------------------ */

  /** Create a blocked slot (vacation, OOO, personal block). */
  async createBlockedSlot(userId: string, tenantId: string, dto: any) {
    return this.prisma.blockedSlot.create({
      data: {
        tenantId,
        userId,
        title: dto.title,
        reason: dto.reason,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        allDay: dto.allDay ?? false,
        status: dto.status ?? 'OUT_OF_OFFICE',
        isRecurring: dto.isRecurring ?? false,
        recurrencePattern: dto.recurrencePattern ?? undefined,
      },
    });
  }

  /** Delete a blocked slot (soft-delete via isActive flag). */
  async deleteBlockedSlot(id: string, userId: string, tenantId: string) {
    const slot = await this.prisma.blockedSlot.findFirst({
      where: { id, userId, tenantId, isActive: true },
    });
    if (!slot) throw new NotFoundException('Blocked slot not found');

    await this.prisma.blockedSlot.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /** List blocked slots for a user in a date range. */
  async listBlockedSlots(
    userId: string,
    tenantId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return this.prisma.blockedSlot.findMany({
      where: {
        tenantId,
        userId,
        isActive: true,
        startTime: { lte: endDate },
        endTime: { gte: startDate },
      },
      orderBy: { startTime: 'asc' },
    });
  }

  /* ------------------------------------------------------------------ */
  /*  Conflict Checking                                                  */
  /* ------------------------------------------------------------------ */

  /** Check for event & blocked-slot conflicts for a time range. */
  async checkConflicts(
    userId: string,
    tenantId: string,
    startTime: Date,
    endTime: Date,
    excludeEventId?: string,
  ) {
    // Overlapping scheduled events (not cancelled)
    const eventWhere: any = {
      tenantId,
      organizerId: userId,
      isActive: true,
      status: { notIn: ['CANCELLED'] },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    };
    if (excludeEventId) {
      eventWhere.id = { not: excludeEventId };
    }

    const eventConflicts = await this.prisma.scheduledEvent.findMany({
      where: eventWhere,
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    // Overlapping blocked slots
    const blockedConflicts = await this.prisma.blockedSlot.findMany({
      where: {
        tenantId,
        userId,
        isActive: true,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: {
        id: true,
        title: true,
        startTime: true,
        endTime: true,
        status: true,
      },
    });

    const conflicts = [
      ...eventConflicts.map((e) => ({ ...e, type: 'EVENT' as const })),
      ...blockedConflicts.map((b) => ({ ...b, type: 'BLOCKED_SLOT' as const })),
    ];

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Free Slot Finder                                                   */
  /* ------------------------------------------------------------------ */

  /** Find free slots across multiple users for a given date. */
  async findFreeSlots(
    userIds: string[],
    tenantId: string,
    date: Date,
    durationMinutes: number,
    timezone?: string,
  ) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    const dayOfWeek = dayStart.getDay(); // 0=Sun .. 6=Sat

    // 1. Check holiday calendar for the date
    const holiday = await this.prisma.holidayCalendar.findFirst({
      where: {
        tenantId,
        isActive: true,
        date: {
          gte: dayStart,
          lte: dayEnd,
        },
      },
    });

    // Full holiday => no slots available
    if (holiday && !holiday.isHalfDay) {
      return [];
    }

    // 2. Per-user: compute free windows
    const perUserFreeWindows: Map<string, TimeRange[]> = new Map();

    for (const userId of userIds) {
      // 2a. Get working hours for that day
      const workingHour = await this.prisma.userAvailability.findFirst({
        where: {
          tenantId,
          userId,
          dayOfWeek,
          isActive: true,
        },
      });

      // No working hours configured or not a working day => user not available
      if (!workingHour || !workingHour.isWorkingDay) {
        perUserFreeWindows.set(userId, []);
        continue;
      }

      // Build working window as absolute Date
      const workStart = this.timeStringToDate(dayStart, workingHour.startTime);
      let workEnd = this.timeStringToDate(dayStart, workingHour.endTime);

      // Half-day holiday: cap working hours at halfDayEnd (e.g. "13:00")
      if (holiday?.isHalfDay && holiday.halfDayEnd) {
        const halfEnd = this.timeStringToDate(dayStart, holiday.halfDayEnd);
        if (halfEnd.getTime() < workEnd.getTime()) {
          workEnd = halfEnd;
        }
      }

      // 2b. Get busy ranges: scheduled events + blocked slots
      const events = await this.prisma.scheduledEvent.findMany({
        where: {
          tenantId,
          organizerId: userId,
          isActive: true,
          status: { notIn: ['CANCELLED'] },
          startTime: { lt: workEnd },
          endTime: { gt: workStart },
        },
        select: { startTime: true, endTime: true },
        orderBy: { startTime: 'asc' },
      });

      const blocked = await this.prisma.blockedSlot.findMany({
        where: {
          tenantId,
          userId,
          isActive: true,
          startTime: { lt: workEnd },
          endTime: { gt: workStart },
        },
        select: { startTime: true, endTime: true },
        orderBy: { startTime: 'asc' },
      });

      const busyRanges: TimeRange[] = [
        ...events.map((e) => ({ start: e.startTime, end: e.endTime })),
        ...blocked.map((b) => ({ start: b.startTime, end: b.endTime })),
      ].sort((a, b) => a.start.getTime() - b.start.getTime());

      // 2c. Subtract busy from working window
      const freeWindows = this.subtractRanges(
        { start: workStart, end: workEnd },
        busyRanges,
      );

      perUserFreeWindows.set(userId, freeWindows);
    }

    // 3. Slice free windows into slots of durationMinutes
    const durationMs = durationMinutes * 60 * 1000;
    const allSlots: Map<string, Set<string>> = new Map(); // timeKey -> set of userIds available

    for (const userId of userIds) {
      const windows = perUserFreeWindows.get(userId) || [];
      for (const w of windows) {
        let slotStart = new Date(w.start);
        while (slotStart.getTime() + durationMs <= w.end.getTime()) {
          const key = slotStart.toISOString();
          if (!allSlots.has(key)) allSlots.set(key, new Set());
          allSlots.get(key)!.add(userId);
          slotStart = new Date(slotStart.getTime() + durationMs);
        }
      }
    }

    // 4. Build result
    const result: { startTime: Date; endTime: Date; availableForAll: boolean }[] = [];
    const sortedKeys = [...allSlots.keys()].sort();

    for (const key of sortedKeys) {
      const available = allSlots.get(key)!;
      result.push({
        startTime: new Date(key),
        endTime: new Date(new Date(key).getTime() + durationMs),
        availableForAll: available.size === userIds.length,
      });
    }

    return result;
  }

  /* ------------------------------------------------------------------ */
  /*  Availability Status                                                */
  /* ------------------------------------------------------------------ */

  /** Get current availability status for a user at a specific time. */
  async getAvailabilityStatus(
    userId: string,
    tenantId: string,
    dateTime: Date,
  ): Promise<string> {
    const dayOfWeek = dateTime.getDay();

    // 1. Check working hours
    const workingHour = await this.prisma.userAvailability.findFirst({
      where: { tenantId, userId, dayOfWeek, isActive: true },
    });

    if (!workingHour || !workingHour.isWorkingDay) {
      return 'OUT_OF_OFFICE';
    }

    const dayStart = new Date(dateTime);
    dayStart.setHours(0, 0, 0, 0);
    const workStart = this.timeStringToDate(dayStart, workingHour.startTime);
    const workEnd = this.timeStringToDate(dayStart, workingHour.endTime);

    if (dateTime < workStart || dateTime >= workEnd) {
      return 'OUT_OF_OFFICE';
    }

    // 2. Check blocked slots
    const blockedSlot = await this.prisma.blockedSlot.findFirst({
      where: {
        tenantId,
        userId,
        isActive: true,
        startTime: { lte: dateTime },
        endTime: { gt: dateTime },
      },
    });

    if (blockedSlot) {
      return blockedSlot.status || 'OUT_OF_OFFICE';
    }

    // 3. Check scheduled events
    const event = await this.prisma.scheduledEvent.findFirst({
      where: {
        tenantId,
        organizerId: userId,
        isActive: true,
        status: { notIn: ['CANCELLED'] },
        startTime: { lte: dateTime },
        endTime: { gt: dateTime },
      },
    });

    if (event) {
      if (event.status === 'CONFIRMED' || event.status === 'IN_PROGRESS') {
        return 'BUSY';
      }
      if (event.status === 'SCHEDULED') {
        return 'TENTATIVE';
      }
      return 'BUSY';
    }

    return 'FREE';
  }

  /* ------------------------------------------------------------------ */
  /*  Private Helpers                                                     */
  /* ------------------------------------------------------------------ */

  /** Convert "HH:MM" string to a Date on the given day. */
  private timeStringToDate(dayBase: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const d = new Date(dayBase);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  /** Subtract busy ranges from a working window, returning free ranges. */
  private subtractRanges(
    working: TimeRange,
    busy: TimeRange[],
  ): TimeRange[] {
    const free: TimeRange[] = [];
    let cursor = new Date(working.start);

    for (const b of busy) {
      // Clamp busy range to working window
      const busyStart = b.start < working.start ? working.start : b.start;
      const busyEnd = b.end > working.end ? working.end : b.end;

      if (busyStart >= working.end || busyEnd <= working.start) continue;

      if (cursor < busyStart) {
        free.push({ start: new Date(cursor), end: new Date(busyStart) });
      }
      if (busyEnd > cursor) {
        cursor = new Date(busyEnd);
      }
    }

    // Remaining window after last busy range
    if (cursor < working.end) {
      free.push({ start: new Date(cursor), end: new Date(working.end) });
    }

    return free;
  }
}
