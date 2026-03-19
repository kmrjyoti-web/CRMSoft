import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/prisma/prisma.service';

@Injectable()
export class NotificationConfigService {
  private readonly logger = new Logger(NotificationConfigService.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Get config for a specific event code. */
  async getConfigForEvent(eventCode: string, tenantId = '') {
    return this.prisma.notificationConfig.findUnique({
      where: { tenantId_eventCode: { tenantId, eventCode } },
      include: { template: true },
    });
  }

  /** Get all notification configs. */
  async getAllConfigs(tenantId = '') {
    return this.prisma.notificationConfig.findMany({
      where: { tenantId },
      include: { template: true },
      orderBy: { eventCode: 'asc' },
    });
  }

  /** Upsert a notification config for an event code. */
  async upsertConfig(eventCode: string, channels: string[], templateId?: string, tenantId = '') {
    return this.prisma.notificationConfig.upsert({
      where: { tenantId_eventCode: { tenantId, eventCode } },
      update: { channels, templateId, updatedAt: new Date() },
      create: { tenantId, eventCode, channels, templateId },
      include: { template: true },
    });
  }

  /** Check if an event is enabled. */
  async isEventEnabled(eventCode: string, tenantId = ''): Promise<boolean> {
    const config = await this.prisma.notificationConfig.findUnique({
      where: { tenantId_eventCode: { tenantId, eventCode } },
    });
    return config?.isEnabled ?? true; // enabled by default if no config
  }

  /** Get channels configured for an event. */
  async getChannelsForEvent(eventCode: string, tenantId = ''): Promise<string[]> {
    const config = await this.getConfigForEvent(eventCode, tenantId);
    if (!config || !config.isEnabled) return [];
    return (config.channels as string[]) || ['IN_APP'];
  }
}
