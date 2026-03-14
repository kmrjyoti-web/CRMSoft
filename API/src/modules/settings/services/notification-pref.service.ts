import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { NotificationConfig, Prisma } from '@prisma/client';

@Injectable()
export class NotificationPrefService {
  private readonly logger = new Logger(NotificationPrefService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get notification config for a specific event.
   * Called by NotificationService when an event occurs.
   */
  async getForEvent(tenantId: string, eventCode: string): Promise<NotificationConfig | null> {
    return this.prisma.notificationConfig.findUnique({
      where: { tenantId_eventCode: { tenantId, eventCode } },
    });
  }

  /** Get all preferences grouped by category. */
  async getAllGrouped(tenantId: string): Promise<Record<string, NotificationConfig[]>> {
    const all = await this.prisma.notificationConfig.findMany({
      where: { tenantId },
      orderBy: [{ eventCategory: 'asc' }, { eventName: 'asc' }],
    });
    const grouped: Record<string, NotificationConfig[]> = {};
    for (const pref of all) {
      const cat = pref.eventCategory ?? 'SYSTEM';
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(pref);
    }
    return grouped;
  }

  /** Update a single event's notification channels. */
  async update(
    tenantId: string,
    eventCode: string,
    data: Prisma.NotificationConfigUpdateInput,
  ): Promise<NotificationConfig> {
    return this.prisma.notificationConfig.update({
      where: { tenantId_eventCode: { tenantId, eventCode } },
      data,
    });
  }

  /** Bulk update multiple events. */
  async bulkUpdate(
    tenantId: string,
    updates: { eventCode: string; changes: Prisma.NotificationConfigUpdateInput }[],
  ): Promise<void> {
    await this.prisma.$transaction(
      updates.map((u) =>
        this.prisma.notificationConfig.update({
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
    if (pref.enableInAppAlert) channels.push('IN_APP');
    if (pref.enableEmail) channels.push('EMAIL');
    if (pref.enableSms) channels.push('SMS');
    if (pref.enableWhatsapp) channels.push('WHATSAPP');
    if (pref.enablePush) channels.push('PUSH');
    this.logger.log(`Test notification for ${eventCode}: ${channels.join(', ')}`);
    return { sent: true, channels };
  }
}
