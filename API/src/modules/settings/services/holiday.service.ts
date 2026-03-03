import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { HolidayCalendar, HolidayType } from '@prisma/client';
import { AppError } from '../../../common/errors/app-error';

@Injectable()
export class HolidayService {
  private readonly logger = new Logger(HolidayService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Create a holiday entry. */
  async create(tenantId: string, data: {
    name: string; date: string; type?: HolidayType; isRecurring?: boolean;
    applicableStates?: string[]; isHalfDay?: boolean; halfDayEnd?: string; description?: string;
  }): Promise<HolidayCalendar> {
    return this.prisma.holidayCalendar.create({
      data: {
        tenantId,
        name: data.name,
        date: new Date(data.date),
        type: data.type ?? 'COMPANY',
        isRecurring: data.isRecurring ?? false,
        applicableStates: data.applicableStates ?? [],
        isHalfDay: data.isHalfDay ?? false,
        halfDayEnd: data.halfDayEnd,
        description: data.description,
      },
    });
  }

  /** List holidays with optional year and type filter. */
  async list(tenantId: string, year?: number, type?: HolidayType): Promise<HolidayCalendar[]> {
    const where: any = { tenantId, isActive: true };
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lt: new Date(`${year + 1}-01-01`),
      };
    }
    if (type) where.type = type;
    return this.prisma.holidayCalendar.findMany({ where, orderBy: { date: 'asc' } });
  }

  /** Get next N upcoming holidays. */
  async upcoming(tenantId: string, limit = 10): Promise<HolidayCalendar[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.prisma.holidayCalendar.findMany({
      where: { tenantId, isActive: true, date: { gte: today } },
      orderBy: { date: 'asc' },
      take: limit,
    });
  }

  /** Update a holiday. */
  async update(tenantId: string, id: string, data: Partial<HolidayCalendar> & { date?: string }): Promise<HolidayCalendar> {
    const holiday = await this.prisma.holidayCalendar.findFirst({ where: { id, tenantId } });
    if (!holiday) throw AppError.from('NOT_FOUND');
    const { date, ...rest } = data;
    return this.prisma.holidayCalendar.update({
      where: { id },
      data: { ...rest, ...(date ? { date: new Date(date) } : {}) },
    });
  }

  /** Delete a holiday (soft: set isActive = false). */
  async remove(tenantId: string, id: string): Promise<void> {
    const holiday = await this.prisma.holidayCalendar.findFirst({ where: { id, tenantId } });
    if (!holiday) throw AppError.from('NOT_FOUND');
    await this.prisma.holidayCalendar.update({ where: { id }, data: { isActive: false } });
  }

  /** Check if a specific date is a holiday. */
  async isHoliday(tenantId: string, date: Date, state?: string): Promise<boolean> {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const holidays = await this.prisma.holidayCalendar.findMany({
      where: { tenantId, isActive: true, date: { gte: startOfDay, lt: endOfDay } },
    });
    for (const h of holidays) {
      if (h.type === 'REGIONAL' && state) {
        if (h.applicableStates.includes(state)) return true;
      } else if (h.type !== 'REGIONAL') {
        return true;
      }
    }
    return false;
  }
}
