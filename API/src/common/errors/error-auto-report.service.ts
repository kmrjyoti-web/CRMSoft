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
  async checkAndReport(errorLog: any): Promise<void> {
    try {
      const rules = await this.prisma.errorAutoReportRule.findMany({
        where: {
          severity: errorLog.severity,
          isActive: true,
          OR: [
            { tenantId: null },
            { tenantId: errorLog.tenantId },
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
        await this.prisma.errorLog.update({
          where: { id: errorLog.id },
          data: {
            isAutoReported: true,
            autoReportedAt: new Date(),
            autoReportedTo: rule.channels,
          },
        });

        // Update rule last triggered timestamp
        await this.prisma.errorAutoReportRule.update({
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
    return this.prisma.errorAutoReportRule.findMany({
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
    return this.prisma.errorAutoReportRule.create({
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
    return this.prisma.errorAutoReportRule.update({
      where: { id },
      data: updateData,
    });
  }

  /** Delete an auto-report rule. */
  async deleteRule(id: string) {
    return this.prisma.errorAutoReportRule.delete({ where: { id } });
  }
}
