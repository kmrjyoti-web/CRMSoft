import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { Prisma } from '@prisma/identity-client';
import { NotificationConfig } from '@prisma/working-client';
export declare class NotificationPrefService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getForEvent(tenantId: string, eventCode: string): Promise<NotificationConfig | null>;
    getAllGrouped(tenantId: string): Promise<Record<string, NotificationConfig[]>>;
    update(tenantId: string, eventCode: string, data: Prisma.NotificationConfigUpdateInput): Promise<NotificationConfig>;
    bulkUpdate(tenantId: string, updates: {
        eventCode: string;
        changes: Prisma.NotificationConfigUpdateInput;
    }[]): Promise<void>;
    sendTest(tenantId: string, eventCode: string): Promise<{
        sent: boolean;
        channels: string[];
    }>;
}
