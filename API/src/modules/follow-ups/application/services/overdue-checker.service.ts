import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class OverdueCheckerService {
  private readonly logger = new Logger(OverdueCheckerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Called by cron-engine (CHECK_OVERDUE_FOLLOWUPS). */
  async checkOverdueFollowUps() {
    const now = new Date();

    const result = await this.prisma.followUp.updateMany({
      where: {
        isActive: true,
        completedAt: null,
        isOverdue: false,
        dueDate: { lt: now },
        OR: [
          { snoozedUntil: null },
          { snoozedUntil: { lt: now } },
        ],
      },
      data: { isOverdue: true },
    });

    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} follow-ups as overdue`);
    }
  }
}
