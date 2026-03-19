import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class ReminderProcessorService {
  private readonly logger = new Logger(ReminderProcessorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Process due reminders. Called by cron-engine (PROCESS_REMINDERS). */
  async processDueReminders() {
    const now = new Date();

    // 1. Re-activate snoozed reminders whose snooze time has passed
    const unsnoozed = await this.prisma.reminder.updateMany({
      where: { isActive: true, status: 'SNOOZED', snoozedUntil: { lte: now } },
      data: { status: 'PENDING', snoozedUntil: null },
    });
    if (unsnoozed.count > 0) {
      this.logger.log(`Re-activated ${unsnoozed.count} snoozed reminders`);
    }

    // 2. Fetch PENDING reminders that are due
    const dueReminders = await this.prisma.reminder.findMany({
      where: { isActive: true, status: 'PENDING', scheduledAt: { lte: now } },
      include: { recipient: { select: { id: true, email: true, firstName: true } } },
      take: 100,
    });

    if (dueReminders.length === 0) return;

    for (const reminder of dueReminders) {
      try {
        switch (reminder.channel) {
          case 'IN_APP':
            this.logger.log(`[IN_APP] Reminder "${reminder.title}" for user ${reminder.recipientId}`);
            break;
          case 'EMAIL':
            this.logger.log(`[EMAIL] Would send to ${reminder.recipient.email}: ${reminder.title}`);
            break;
          case 'SMS':
            this.logger.log(`[SMS] Would send to user ${reminder.recipientId}: ${reminder.title}`);
            break;
          case 'PUSH':
            this.logger.log(`[PUSH] Would push to user ${reminder.recipientId}: ${reminder.title}`);
            break;
          case 'WHATSAPP':
            this.logger.log(`[WHATSAPP] Would send to user ${reminder.recipientId}: ${reminder.title}`);
            break;
        }

        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: { isSent: true, sentAt: now, status: 'TRIGGERED', triggeredAt: now },
        });
      } catch (error) {
        this.logger.error(`Failed to process reminder ${reminder.id}: ${getErrorMessage(error)}`);
      }
    }

    this.logger.log(`Processed ${dueReminders.length} reminders`);
  }

  /** Detect missed reminders: PENDING > 1 hour past scheduledAt. */
  async detectMissedReminders() {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const missed = await this.prisma.reminder.updateMany({
      where: {
        isActive: true,
        status: 'PENDING',
        scheduledAt: { lt: oneHourAgo },
      },
      data: { status: 'MISSED', missedAt: new Date() },
    });

    if (missed.count > 0) {
      this.logger.log(`Marked ${missed.count} reminders as MISSED`);
    }

    return missed.count;
  }
}
