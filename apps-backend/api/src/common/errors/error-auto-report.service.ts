import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { getErrorMessage } from '@/common/utils/error.utils';

/**
 * Manages auto-report rules and triggers notifications for error logs
 * based on severity thresholds and throttle windows.
 */
@Injectable()
export class ErrorAutoReportService {
  private readonly logger = new Logger('ErrorAutoReport');

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Check all matching rules for an error log and trigger notifications.
   * Called fire-and-forget after persisting an error log.
   */
  async checkAndReport(errorLog: Record<string, unknown>): Promise<void> {
    try {
      const rules = await this.prisma.platform.errorAutoReportRule.findMany({
        where: {
          severity: errorLog.severity as any,
          isActive: true,
          OR: [
            { tenantId: null },
            { tenantId: errorLog.tenantId as string },
          ],
        },
      });

      for (const rule of rules) {
        // Check throttle — skip if triggered too recently
        if (rule.lastTriggeredAt) {
          const minutesSince = (Date.now() - rule.lastTriggeredAt.getTime()) / 60000;
          if (minutesSince < rule.throttleMinutes) continue;
        }

        // Log that we would send notifications (actual email/slack/whatsapp integration is external)
        this.logger.log(
          `Auto-report triggered: rule="${rule.name}" severity=${errorLog.severity} channels=${rule.channels.join(',')}`,
        );

        // Update error log with auto-report info
        await this.prisma.platform.errorLog.update({
          where: { id: errorLog.id as string },
          data: {
            isAutoReported: true,
            autoReportedAt: new Date(),
            autoReportedTo: rule.channels,
          },
        });

        // Update rule last triggered timestamp
        await this.prisma.platform.errorAutoReportRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date() },
        });
      }
    } catch (err) {
      this.logger.error(`Auto-report check failed: ${getErrorMessage(err)}`);
    }
  }

  /** List all auto-report rules, optionally filtered by tenantId. */
  async listRules(tenantId?: string) {
    const where: any = {};
    if (tenantId) {
      where.OR = [{ tenantId: null }, { tenantId }];
    }
    return this.prisma.platform.errorAutoReportRule.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /** Create a new auto-report rule. */
  async createRule(data: {
    name: string;
    severity: string;
    channels: string[];
    tenantId?: string;
    emailRecipients?: string[];
    slackWebhookUrl?: string;
    whatsappNumbers?: string[];
    throttleMinutes?: number;
    isActive?: boolean;
  }) {
    return this.prisma.platform.errorAutoReportRule.create({
      data: {
        name: data.name,
        severity: data.severity as any,
        channels: data.channels,
        tenantId: data.tenantId,
        emailRecipients: data.emailRecipients || [],
        slackWebhookUrl: data.slackWebhookUrl,
        whatsappNumbers: data.whatsappNumbers || [],
        throttleMinutes: data.throttleMinutes ?? 15,
        isActive: data.isActive ?? true,
      },
    });
  }

  /** Update an existing auto-report rule. */
  async updateRule(id: string, data: Partial<{
    name: string;
    severity: string;
    channels: string[];
    emailRecipients: string[];
    slackWebhookUrl: string;
    whatsappNumbers: string[];
    throttleMinutes: number;
    isActive: boolean;
  }>) {
    const updateData: any = { ...data };
    if (data.severity) updateData.severity = data.severity as any;
    return this.prisma.platform.errorAutoReportRule.update({
      where: { id },
      data: updateData,
    });
  }

  /** Delete an auto-report rule. */
  async deleteRule(id: string) {
    return this.prisma.platform.errorAutoReportRule.delete({ where: { id } });
  }

  /**
   * Manually report a CRITICAL error to the software provider.
   * Called from the vendor panel "Report to Provider" button.
   * Updates the error log with reportedToProvider=true and fires all CRITICAL channels.
   */
  async reportToProvider(errorLogId: string, reportedById: string): Promise<{ reported: boolean }> {
    const errorLog = await this.prisma.platform.errorLog.findUnique({
      where: { id: errorLogId },
    });

    if (!errorLog) {
      return { reported: false };
    }

    // Mark as reported
    await this.prisma.platform.errorLog.update({
      where: { id: errorLogId },
      data: {
        reportedToProvider: true,
        reportedToProviderAt: new Date(),
        reportedToProviderById: reportedById,
      } as any,
    });

    // Fire all CRITICAL auto-report rules (ignoring throttle for manual reports)
    try {
      const criticalRules = await this.prisma.platform.errorAutoReportRule.findMany({
        where: { severity: 'CRITICAL', isActive: true },
      });

      for (const rule of criticalRules) {
        this.logger.log(
          `Manual provider report triggered: rule="${rule.name}" channels=${rule.channels.join(',')} for errorLogId=${errorLogId}`,
        );
        // Update rule last triggered timestamp
        await this.prisma.platform.errorAutoReportRule.update({
          where: { id: rule.id },
          data: { lastTriggeredAt: new Date() },
        });
      }
    } catch (err) {
      this.logger.error(`Failed to fire provider report channels: ${getErrorMessage(err)}`);
    }

    return { reported: true };
  }
}
