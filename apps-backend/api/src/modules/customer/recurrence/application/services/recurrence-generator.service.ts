import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class RecurrenceGeneratorService {
  private readonly logger = new Logger(RecurrenceGeneratorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (GENERATE_RECURRENCES). */
  async generateOccurrences() {
    const now = new Date();
    const events = await this.prisma.working.recurringEvent.findMany({
      where: {
        isActive: true,
        nextOccurrence: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
        AND: [
          { OR: [{ maxOccurrences: null }, { occurrenceCount: { lt: this.prisma.working.recurringEvent.fields?.maxOccurrences as any } }] },
        ],
      },
      take: 100,
    });

    for (const event of events) {
      if (event.maxOccurrences && event.occurrenceCount >= event.maxOccurrences) {
        await this.prisma.working.recurringEvent.update({ where: { id: event.id }, data: { isActive: false } });
        continue;
      }

      try {
        const nextDate = this.calculateNextOccurrence(event);

        await this.prisma.working.recurringEvent.update({
          where: { id: event.id },
          data: {
            lastGenerated: now,
            nextOccurrence: nextDate,
            occurrenceCount: { increment: 1 },
          },
        });

        this.logger.log(`Generated occurrence for recurring event ${event.id}, next: ${nextDate.toISOString()}`);
      } catch (error) {
        this.logger.error(`Failed to generate occurrence for ${event.id}: ${getErrorMessage(error)}`);
      }
    }

    if (events.length > 0) {
      this.logger.log(`Processed ${events.length} recurring events`);
    }
  }

  private calculateNextOccurrence(event: any): Date {
    const current = new Date(event.nextOccurrence);
    const interval = event.interval || 1;

    switch (event.pattern) {
      case 'DAILY':
        current.setDate(current.getDate() + interval);
        break;
      case 'WEEKLY':
        current.setDate(current.getDate() + 7 * interval);
        break;
      case 'MONTHLY':
        current.setMonth(current.getMonth() + interval);
        if (event.dayOfMonth) {
          current.setDate(Math.min(event.dayOfMonth, new Date(current.getFullYear(), current.getMonth() + 1, 0).getDate()));
        }
        break;
    }

    return current;
  }
}
