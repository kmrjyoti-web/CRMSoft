import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

/**
 * Seeds payment-related configurations for a new tenant:
 * - AutoNumberSequence entries for Payment, Receipt, Refund, CreditNote
 * - TenantConfig keys for payment settings
 * - CronJobConfig entries for payment reminders and overdue marking
 */
@Injectable()
export class PaymentSeederService {
  private readonly logger = new Logger(PaymentSeederService.name);

  constructor(private readonly prisma: PrismaService) {}

  async seedAll(tenantId: string) {
    await Promise.all([
      this.seedAutoNumbers(tenantId),
      this.seedTenantConfigs(tenantId),
      this.seedCronJobs(tenantId),
    ]);
    this.logger.log(`Payment seeds completed for tenant ${tenantId}`);
  }

  private async seedAutoNumbers(tenantId: string) {
    const sequences = [
      { entityName: 'Payment', prefix: 'PAY', formatPattern: 'PAY-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
      { entityName: 'Receipt', prefix: 'RCT', formatPattern: 'RCT-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
      { entityName: 'Refund', prefix: 'RFD', formatPattern: 'RFD-{YYYY}-{SEQ:5}', resetPolicy: 'YEARLY' },
      { entityName: 'CreditNote', prefix: 'CN', formatPattern: 'CN-{YYYY}/{MM}-{SEQ:4}', resetPolicy: 'YEARLY' },
    ];

    for (const seq of sequences) {
      await this.prisma.autoNumberSequence.upsert({
        where: { tenantId_entityName: { tenantId, entityName: seq.entityName } },
        update: {},
        create: {
          tenantId,
          entityName: seq.entityName,
          prefix: seq.prefix,
          formatPattern: seq.formatPattern,
          currentSequence: 0,
          resetPolicy: seq.resetPolicy as any,
          isActive: true,
        },
      });
    }
  }

  private async seedTenantConfigs(tenantId: string) {
    const configs = [
      {
        configKey: 'payment.default_gateway',
        configValue: 'MANUAL',
        category: 'GENERAL',
        valueType: 'ENUM',
        displayName: 'Default Payment Gateway',
        description: 'Default payment gateway for new invoices',
        groupName: 'Payment',
        enumOptions: JSON.stringify(['MANUAL', 'RAZORPAY', 'STRIPE']),
      },
      {
        configKey: 'payment.default_due_days',
        configValue: '30',
        category: 'GENERAL',
        valueType: 'INTEGER',
        displayName: 'Default Invoice Due Days',
        description: 'Number of days from invoice date to set as default due date',
        groupName: 'Payment',
      },
      {
        configKey: 'payment.auto_receipt',
        configValue: 'true',
        category: 'GENERAL',
        valueType: 'BOOLEAN',
        displayName: 'Auto-Generate Receipt',
        description: 'Automatically generate receipt on payment capture',
        groupName: 'Payment',
      },
      {
        configKey: 'payment.reminder_enabled',
        configValue: 'true',
        category: 'NOTIFICATION',
        valueType: 'BOOLEAN',
        displayName: 'Payment Reminders',
        description: 'Enable automatic payment reminders for overdue invoices',
        groupName: 'Payment',
      },
      {
        configKey: 'payment.default_currency',
        configValue: 'INR',
        category: 'GENERAL',
        valueType: 'STRING',
        displayName: 'Default Currency',
        description: 'Default currency for invoices and payments',
        groupName: 'Payment',
      },
      {
        configKey: 'payment.gst_enabled',
        configValue: 'true',
        category: 'GENERAL',
        valueType: 'BOOLEAN',
        displayName: 'GST Enabled',
        description: 'Enable GST calculations on invoices',
        groupName: 'Payment',
      },
    ];

    for (const config of configs) {
      await this.prisma.tenantConfig.upsert({
        where: { tenantId_configKey: { tenantId, configKey: config.configKey } },
        update: {},
        create: {
          tenantId,
          configKey: config.configKey,
          configValue: config.configValue,
          category: config.category as any,
          valueType: config.valueType as any,
          displayName: config.displayName,
          description: config.description,
          groupName: config.groupName,
          enumOptions: config.enumOptions ? JSON.parse(config.enumOptions) : undefined,
        },
      });
    }
  }

  private async seedCronJobs(_tenantId: string) {
    const cronJobs = [
      {
        jobCode: 'PAYMENT_REMINDER_CHECK',
        jobName: 'Payment Reminder Check',
        moduleName: 'PAYMENT',
        description: 'Send payment reminders for overdue invoices based on escalation ladder',
        cronExpression: '0 9 * * *',
        timeoutSeconds: 120,
      },
      {
        jobCode: 'OVERDUE_INVOICE_MARK',
        jobName: 'Overdue Invoice Marker',
        moduleName: 'PAYMENT',
        description: 'Mark invoices past due date as OVERDUE',
        cronExpression: '0 0 * * *',
        timeoutSeconds: 120,
      },
    ];

    for (const job of cronJobs) {
      await this.prisma.cronJobConfig.upsert({
        where: { jobCode: job.jobCode },
        update: {},
        create: job,
      });
    }
  }
}
