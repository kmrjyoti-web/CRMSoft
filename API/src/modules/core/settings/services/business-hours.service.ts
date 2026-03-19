import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { BusinessHoursSchedule, DayOfWeek } from '@prisma/client';
import { UpdateBusinessHoursDto } from '../presentation/dto/update-business-hours.dto';

/** Map JS getDay() (0=Sun) to our DayOfWeek enum. */
const JS_DAY_MAP: DayOfWeek[] = [
  DayOfWeek.SUNDAY, DayOfWeek.MONDAY, DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY,
];

@Injectable()
export class BusinessHoursService {
  private readonly logger = new Logger(BusinessHoursService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Check if current time is within business hours (respecting holidays). */
  async isWorkingNow(tenantId: string): Promise<boolean> {
    const now = new Date();
    const day = JS_DAY_MAP[now.getDay()];

    // Check if today is a holiday
    const isHoliday = await this.isHoliday(tenantId, now);
    if (isHoliday) return false;

    const schedule = await this.prisma.businessHoursSchedule.findUnique({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
    });
    if (!schedule || !schedule.isWorkingDay) return false;

    const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (!schedule.startTime || !schedule.endTime) return false;
    if (hhmm < schedule.startTime || hhmm >= schedule.endTime) return false;

    // Check lunch break
    if (schedule.breakStartTime && schedule.breakEndTime) {
      if (hhmm >= schedule.breakStartTime && hhmm < schedule.breakEndTime) return false;
    }
    return true;
  }

  /** Get next working time. If now is working → return now, else next work start. */
  async getNextWorkingTime(tenantId: string, from?: Date): Promise<Date> {
    const start = from ?? new Date();
    for (let offset = 0; offset < 14; offset++) {
      const candidate = new Date(start);
      candidate.setDate(candidate.getDate() + offset);
      const day = JS_DAY_MAP[candidate.getDay()];
      const schedule = await this.prisma.businessHoursSchedule.findUnique({
        where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
      });
      if (!schedule?.isWorkingDay || !schedule.startTime) continue;
      const isHoliday = await this.isHoliday(tenantId, candidate);
      if (isHoliday) continue;

      const [h, m] = schedule.startTime.split(':').map(Number);
      candidate.setHours(h, m, 0, 0);
      if (offset === 0 && start > candidate) {
        // Already past start time today — check if still before end
        if (schedule.endTime) {
          const [eh, em] = schedule.endTime.split(':').map(Number);
          const end = new Date(candidate);
          end.setHours(eh, em, 0, 0);
          if (start < end) return start;
        }
        continue;
      }
      return candidate;
    }
    return start; // Fallback
  }

  /** Calculate total working hours between two dates (for SLA). */
  async calculateWorkingHours(tenantId: string, from: Date, to: Date): Promise<number> {
    let totalMinutes = 0;
    const current = new Date(from);
    while (current < to) {
      const day = JS_DAY_MAP[current.getDay()];
      const schedule = await this.prisma.businessHoursSchedule.findUnique({
        where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
      });
      const isHoliday = await this.isHoliday(tenantId, current);
      if (schedule?.isWorkingDay && !isHoliday && schedule.startTime && schedule.endTime) {
        const dayMinutes = this.timeToMinutes(schedule.endTime) - this.timeToMinutes(schedule.startTime);
        const breakMinutes = schedule.breakStartTime && schedule.breakEndTime
          ? this.timeToMinutes(schedule.breakEndTime) - this.timeToMinutes(schedule.breakStartTime)
          : 0;
        totalMinutes += dayMinutes - breakMinutes;
      }
      current.setDate(current.getDate() + 1);
    }
    return Math.round((totalMinutes / 60) * 100) / 100;
  }

  /** Get the full week schedule. */
  async getWeekSchedule(tenantId: string): Promise<BusinessHoursSchedule[]> {
    return this.prisma.businessHoursSchedule.findMany({
      where: { tenantId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  /** Update a single day's schedule. */
  async updateDay(tenantId: string, day: DayOfWeek, dto: UpdateBusinessHoursDto): Promise<void> {
    const { dayOfWeek: _, ...data } = dto;
    await this.prisma.businessHoursSchedule.upsert({
      where: { tenantId_dayOfWeek: { tenantId, dayOfWeek: day } },
      update: data,
      create: { tenantId, dayOfWeek: day, ...data },
    });
  }

  /** Bulk update the entire week schedule. */
  async updateWeek(tenantId: string, schedules: UpdateBusinessHoursDto[]): Promise<void> {
    await this.prisma.$transaction(
      schedules.map((s) => {
        const { dayOfWeek, ...data } = s;
        return this.prisma.businessHoursSchedule.upsert({
          where: { tenantId_dayOfWeek: { tenantId, dayOfWeek } },
          update: data,
          create: { tenantId, dayOfWeek, ...data },
        });
      }),
    );
  }

  private async isHoliday(tenantId: string, date: Date): Promise<boolean> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const count = await this.prisma.holidayCalendar.count({
      where: { tenantId, isActive: true, date: { gte: startOfDay, lt: endOfDay } },
    });
    return count > 0;
  }

  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
}
