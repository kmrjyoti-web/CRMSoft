import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class ReminderProcessorService {
  private readonly logger = new Logger(ReminderProcessorService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Process due reminders. Called by cron-engine (PROCESS_REMINDERS). */
  async processDueReminders() {
    const now = new Date();

    const dueReminders = await this.prisma.reminder.findMany({
      where: { isActive: true, isSent: false, scheduledAt: { lte: now } },
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
          data: { isSent: true, sentAt: now },
        });
      } catch (error) {
        this.logger.error(`Failed to process reminder ${reminder.id}: ${error.message}`);
      }
    }

    this.logger.log(`Processed ${dueReminders.length} reminders`);
  }
}
