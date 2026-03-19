import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { CronJobConfig, CronJobRunLog } from '@prisma/client';
import { getErrorMessage } from '@/common/utils/error.utils';

/**
 * Sends failure/timeout alerts to configured recipients.
 * Supports EMAIL, IN_APP, or BOTH channels.
 */
@Injectable()
export class CronAlertService {
  private readonly logger = new Logger(CronAlertService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Send failure alert to configured recipients. */
  async sendAlert(
    job: CronJobConfig,
    error: string,
    runLog: CronJobRunLog,
  ): Promise<void> {
    const channel = job.alertChannel;
    const subject = `CRON Job Failed: ${job.jobName}`;
    const body = this.buildAlertBody(job, error, runLog);

    if (channel === 'EMAIL' || channel === 'BOTH') {
      await this.sendEmailAlert(job, subject, body);
    }
    if (channel === 'IN_APP' || channel === 'BOTH') {
      await this.sendInAppAlert(job, subject, body);
    }
  }

  private buildAlertBody(
    job: CronJobConfig,
    error: string,
    runLog: CronJobRunLog,
  ): string {
    return [
      `Job: ${job.jobName} (${job.jobCode})`,
      `Module: ${job.moduleName}`,
      `Error: ${error}`,
      `Failed at: ${runLog.startedAt.toISOString()}`,
      `Consecutive failures: ${job.consecutiveFailures}`,
      `Last success: ${job.lastRunAt?.toISOString() ?? 'Never'}`,
      `Triggered by: ${runLog.triggeredBy}`,
    ].join('\n');
  }

  private async sendEmailAlert(
    job: CronJobConfig,
    subject: string,
    body: string,
  ): Promise<void> {
    if (!job.alertRecipientEmails?.length) return;
    // Delegate to email service when available; for now log
    this.logger.warn(
      `[EMAIL ALERT] ${subject}\nTo: ${job.alertRecipientEmails.join(', ')}\n${body}`,
    );
  }

  private async sendInAppAlert(
    job: CronJobConfig,
    subject: string,
    body: string,
  ): Promise<void> {
    if (!job.alertRecipientUserIds?.length) return;
    try {
      await this.prisma.notification.createMany({
        data: job.alertRecipientUserIds.map((userId) => ({
          recipientId: userId,
          tenantId: '',
          category: 'SYSTEM' as any,
          channel: 'IN_APP' as any,
          title: subject,
          message: body,
          priority: 'HIGH' as any,
          status: 'UNREAD' as any,
        })),
      });
    } catch (err) {
      this.logger.error(`Failed to create in-app alert: ${getErrorMessage(err)}`);
    }
  }
}
