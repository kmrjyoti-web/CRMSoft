import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../core/prisma/prisma.service';

@Injectable()
export class NotificationConfigService {
  private readonly logger = new Logger(NotificationConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get config for a specific event type. */
  async getConfigForEvent(eventType: string, tenantId = '') {
    return this.prisma.notificationConfig.findUnique({
      where: { tenantId_eventType: { tenantId, eventType: eventType as any } },
      include: { template: true },
    });
  }

  /** Get all notification configs. */
  async getAllConfigs(tenantId = '') {
    return this.prisma.notificationConfig.findMany({
      where: { tenantId },
      include: { template: true },
      orderBy: { eventType: 'asc' },
    });
  }

  /** Upsert a notification config for an event type. */
  async upsertConfig(eventType: string, channels: string[], templateId?: string, tenantId = '') {
    return this.prisma.notificationConfig.upsert({
      where: { tenantId_eventType: { tenantId, eventType: eventType as any } },
      update: { channels, templateId, updatedAt: new Date() },
      create: { tenantId, eventType: eventType as any, channels, templateId },
      include: { template: true },
    });
  }

  /** Check if an event type is enabled. */
  async isEventEnabled(eventType: string, tenantId = ''): Promise<boolean> {
    const config = await this.prisma.notificationConfig.findUnique({
      where: { tenantId_eventType: { tenantId, eventType: eventType as any } },
    });
    return config?.isEnabled ?? true; // enabled by default if no config
  }

  /** Get channels configured for an event type. */
  async getChannelsForEvent(eventType: string, tenantId = ''): Promise<string[]> {
    const config = await this.getConfigForEvent(eventType, tenantId);
    if (!config || !config.isEnabled) return [];
    return (config.channels as string[]) || ['IN_APP'];
  }
}
