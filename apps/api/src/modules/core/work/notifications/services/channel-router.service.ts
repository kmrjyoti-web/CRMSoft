import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { NotificationCoreService } from './notification-core.service';
import { NotificationTemplateService } from './template.service';
import { RealtimeService } from './realtime.service';
import { getErrorMessage } from '@/common/utils/error.utils';

@Injectable()
export class ChannelRouterService {
  private readonly logger = new Logger(ChannelRouterService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationCore: NotificationCoreService,
    private readonly templateService: NotificationTemplateService,
    private readonly realtimeService: RealtimeService,
  ) {}

  async send(params: {
    templateName: string;
    recipientId: string;
    senderId?: string;
    variables: Record<string, string>;
    entityType?: string;
    entityId?: string;
    priority?: string;
    groupKey?: string;
    channelOverrides?: string[];
  }) {
    const rendered = await this.templateService.render(params.templateName, params.variables);
    const preference = await this.getPreference(params.recipientId);

    // Determine channels: overrides > preference > template defaults
    let channels = params.channelOverrides || this.resolveChannels(rendered.channels, preference, rendered.category);

    // Respect quiet hours
    if (this.isQuietHours(preference)) {
      channels = channels.filter(ch => ch === 'IN_APP');
    }

    const results: Array<{ channel: string; success: boolean }> = [];

    for (const channel of channels) {
      try {
        if (channel === 'IN_APP') {
          const notification = await this.notificationCore.create({
            category: rendered.category,
            title: rendered.subject,
            message: rendered.body,
            recipientId: params.recipientId,
            senderId: params.senderId,
            priority: params.priority,
            channel: 'IN_APP',
            entityType: params.entityType,
            entityId: params.entityId,
            data: params.variables,
            groupKey: params.groupKey,
          });

          // Push via WebSocket/SSE
          this.realtimeService.sendToUser(params.recipientId, {
            type: 'notification',
            payload: notification,
          });
          results.push({ channel: 'IN_APP', success: true });
        } else if (channel === 'EMAIL') {
          this.logger.log(`Email would be sent to ${params.recipientId}: ${rendered.subject}`);
          results.push({ channel: 'EMAIL', success: true });
        } else if (channel === 'SMS') {
          this.logger.log(`SMS would be sent to ${params.recipientId}: ${rendered.body}`);
          results.push({ channel: 'SMS', success: true });
        } else if (channel === 'PUSH') {
          this.logger.log(`Push would be sent to ${params.recipientId}`);
          results.push({ channel: 'PUSH', success: true });
        } else if (channel === 'WHATSAPP') {
          this.logger.log(`WhatsApp would be sent to ${params.recipientId}`);
          results.push({ channel: 'WHATSAPP', success: true });
        }
      } catch (error) {
        this.logger.error(`Failed to send via ${channel}: ${getErrorMessage(error)}`);
        results.push({ channel, success: false });
      }
    }

    return { channels: results, template: params.templateName };
  }

  private async getPreference(userId: string) {
    return this.prisma.notificationPreference.findUnique({
      where: { userId },
    });
  }

  private resolveChannels(templateChannels: string[], preference: any, category: string): string[] {
    if (!preference) return templateChannels.length > 0 ? templateChannels : ['IN_APP'];

    const categoryPrefs = (preference.categories as any)?.[category];
    if (categoryPrefs?.channels) return categoryPrefs.channels;

    const globalChannels = preference.channels as any;
    if (globalChannels?.enabled) return globalChannels.enabled;

    return templateChannels.length > 0 ? templateChannels : ['IN_APP'];
  }

  private isQuietHours(preference: any): boolean {
    if (!preference?.quietHoursStart || !preference?.quietHoursEnd) return false;

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hours * 60 + minutes;

    const [startH, startM] = preference.quietHoursStart.split(':').map(Number);
    const [endH, endM] = preference.quietHoursEnd.split(':').map(Number);
    const startTime = startH * 60 + startM;
    const endTime = endH * 60 + endM;

    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    }
    return currentTime >= startTime || currentTime <= endTime;
  }
}
