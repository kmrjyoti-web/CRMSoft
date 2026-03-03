import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

/**
 * Payment Reminder Service
 *
 * Escalation ladder (days after due date):
 * - GENTLE:  3 days overdue
 * - FIRM:    7 days overdue
 * - URGENT: 15 days overdue
 * - FINAL:  30 days overdue
 */

const REMINDER_SCHEDULE = [
  { level: 'GENTLE' as const, daysAfterDue: 3 },
  { level: 'FIRM' as const, daysAfterDue: 7 },
  { level: 'URGENT' as const, daysAfterDue: 15 },
  { level: 'FINAL' as const, daysAfterDue: 30 },
];

@Injectable()
export class PaymentReminderService {
  private readonly logger = new Logger(PaymentReminderService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Schedule reminders for an invoice when it's sent */
  async scheduleReminders(tenantId: string, invoiceId: string, dueDate: Date) {
    const reminders = REMINDER_SCHEDULE.map((r) => {
      const scheduledAt = new Date(dueDate);
      scheduledAt.setDate(scheduledAt.getDate() + r.daysAfterDue);
      return {
        tenantId,
        invoiceId,
        level: r.level,
        scheduledAt,
        channel: 'EMAIL',
        isSent: false,
      };
    });

    await this.prisma.paymentReminder.createMany({ data: reminders });
    this.logger.log(`Scheduled ${reminders.length} reminders for invoice ${invoiceId}`);
  }

  /** CRON handler: send due reminders */
  async processDueReminders(tenantId: string) {
    const now = new Date();

    const dueReminders = await this.prisma.paymentReminder.findMany({
      where: {
        tenantId,
        isSent: false,
        scheduledAt: { lte: now },
        invoice: {
          status: { in: ['OVERDUE', 'SENT', 'PARTIALLY_PAID'] },
        },
      },
      include: {
        invoice: { select: { invoiceNo: true, billingName: true, balanceAmount: true, dueDate: true } },
      },
    });

    const results: { id: string; level: string; invoiceNo: string; sent: boolean }[] = [];

    for (const reminder of dueReminders) {
      // In production, this would trigger an email/SMS via notification service
      this.logger.log(
        `[REMINDER] ${reminder.level}: Invoice ${reminder.invoice.invoiceNo} ` +
        `for ${reminder.invoice.billingName}, balance: ${reminder.invoice.balanceAmount}`,
      );

      await this.prisma.paymentReminder.update({
        where: { id: reminder.id },
        data: { isSent: true, sentAt: new Date() },
      });

      results.push({
        id: reminder.id,
        level: reminder.level,
        invoiceNo: reminder.invoice.invoiceNo,
        sent: true,
      });
    }

    return results;
  }

  /** Cancel all pending reminders for an invoice (e.g. when paid) */
  async cancelReminders(tenantId: string, invoiceId: string) {
    const result = await this.prisma.paymentReminder.deleteMany({
      where: { tenantId, invoiceId, isSent: false },
    });
    return result.count;
  }

  /** Get reminders for an invoice */
  async getForInvoice(tenantId: string, invoiceId: string) {
    return this.prisma.paymentReminder.findMany({
      where: { tenantId, invoiceId },
      orderBy: { scheduledAt: 'asc' },
    });
  }
}
