import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class CalendarHighlightsService {
  constructor(private prisma: PrismaService) {}

  async getHighlights(tenantId: string, from: string, to: string, types?: string[]) {
    const where: any = {
      date: {
        gte: new Date(from),
        lte: new Date(to),
      },
      isActive: true,
      OR: [
        { tenantId: null },
        { tenantId },
      ],
    };
    if (types?.length) {
      where.highlightType = { in: types };
    }
    return this.prisma.calendarHighlight.findMany({
      where,
      orderBy: { date: 'asc' },
    });
  }

  async getHolidays(tenantId: string, year: number) {
    const from = new Date(`${year}-01-01`);
    const to = new Date(`${year}-12-31`);
    return this.prisma.calendarHighlight.findMany({
      where: {
        date: { gte: from, lte: to },
        isHoliday: true,
        isActive: true,
        OR: [
          { tenantId: null },
          { tenantId },
        ],
      },
      orderBy: { date: 'asc' },
    });
  }

  async create(tenantId: string, data: {
    date: string;
    title: string;
    highlightType: string;
    color?: string;
    isHoliday?: boolean;
    isRecurring?: boolean;
    recurringType?: string;
    industryCode?: string;
    stateCode?: string;
  }) {
    return this.prisma.calendarHighlight.create({
      data: {
        tenantId,
        date: new Date(data.date),
        title: data.title,
        highlightType: data.highlightType,
        color: data.color ?? '#7C3AED',
        isHoliday: data.isHoliday ?? false,
        isRecurring: data.isRecurring ?? false,
        recurringType: data.recurringType,
        industryCode: data.industryCode,
        stateCode: data.stateCode,
      },
    });
  }
}
