import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { NotificationConfigService } from './notification-config.service';
import { ChannelRouterService } from './channel-router.service';
import { QuietHourService } from './quiet-hour.service';
export interface DispatchEvent {
    tenantId: string;
    eventType: string;
    entityType?: string;
    entityId?: string;
    actorId: string;
    data: Record<string, any>;
}
export declare class NotificationDispatchService {
    private readonly prisma;
    private readonly configService;
    private readonly channelRouter;
    private readonly quietHourService;
    private readonly logger;
    constructor(prisma: PrismaService, configService: NotificationConfigService, channelRouter: ChannelRouterService, quietHourService: QuietHourService);
    dispatch(event: DispatchEvent): Promise<{
        dispatched: number;
        skipped: number;
    }>;
    private resolveRecipients;
    private addCustomRecipients;
    private loadEntity;
    private addWatchers;
    private addDepartmentMembers;
}
