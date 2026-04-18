import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { NotificationCoreService } from './notification-core.service';
import { NotificationTemplateService } from './template.service';
import { RealtimeService } from './realtime.service';
export declare class ChannelRouterService {
    private readonly prisma;
    private readonly notificationCore;
    private readonly templateService;
    private readonly realtimeService;
    private readonly logger;
    constructor(prisma: PrismaService, notificationCore: NotificationCoreService, templateService: NotificationTemplateService, realtimeService: RealtimeService);
    send(params: {
        templateName: string;
        recipientId: string;
        senderId?: string;
        variables: Record<string, string>;
        entityType?: string;
        entityId?: string;
        priority?: string;
        groupKey?: string;
        channelOverrides?: string[];
    }): Promise<{
        channels: {
            channel: string;
            success: boolean;
        }[];
        template: string;
    }>;
    private getPreference;
    private resolveChannels;
    private isQuietHours;
}
