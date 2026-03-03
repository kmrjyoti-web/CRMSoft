import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationEventCategory, TenantNotificationSetting } from '@prisma/client';

@Injectable()
export class NotificationPrefService {
  private readonly logger = new Logger(NotificationPrefService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get notification config for a specific event.
   * Called by NotificationService when an event occurs.
   */
  async getForEvent(tenantId: string, eventCode: string): Promise<TenantNotificationSetting | null> {
    return this.prisma.tenantNotificationSetting.findUnique({
      where: { tenantId_eventCode: { tenantId, eventCode } },
    });
  }

  /** Get all preferences grouped by category. */
  async getAllGrouped(tenantId: string): Promise<Record<string, TenantNotificationSetting[]>> {
    const all = await this.prisma.tenantNotificationSetting.findMany({
      where: { tenantId },
      orderBy: [{ eventCategory: 'asc' }, { eventName: 'asc' }],
    });
    const grouped: Record<string, TenantNotificationSetting[]> = {};
    for (const pref of all) {
      const cat = pref.eventCategory;
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(pref);
    }
    return grouped;
  }

  /** Update a single event's notification channels. */
  async update(
    tenantId: string,
    eventCode: string,
    data: Partial<TenantNotificationSetting>,
  ): Promise<TenantNotificationSetting> {
    return this.prisma.tenantNotificationSetting.update({
      where: { tenantId_eventCode: { tenantId, eventCode } },
      data,
    });
  }

  /** Bulk update multiple events. */
  async bulkUpdate(
    tenantId: string,
    updates: { eventCode: string; changes: Partial<TenantNotificationSetting> }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.tenantNotificationSetting.update({
          where: { tenantId_eventCode: { tenantId, eventCode: u.eventCode } },
          data: u.changes,
        }),
      ),
    );
  }

  /** Send a test notification for a specific event (stub). */
  async sendTest(tenantId: string, eventCode: string): Promise<{ sent: boolean; channels: string[] }> {
    const pref = await this.getForEvent(tenantId, eventCode);
    if (!pref) return { sent: false, channels: [] };
    const channels: string[] = [];
    if (pref.inAppEnabled) channels.push('IN_APP');
    if (pref.emailEnabled) channels.push('EMAIL');
    if (pref.smsEnabled) channels.push('SMS');
    if (pref.whatsappEnabled) channels.push('WHATSAPP');
    if (pref.pushEnabled) channels.push('PUSH');
    this.logger.log(`Test notification for ${eventCode}: ${channels.join(', ')}`);
    return { sent: true, channels };
  }
}
