import { PrismaService } from '../../../../../core/prisma/prisma.service';
export declare class PreferenceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getPreferences(userId: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        timezone: string;
        channels: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string;
        categories: import("@prisma/working-client/runtime/library").JsonValue;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
        digestFrequency: import("@prisma/working-client").$Enums.DigestFrequency;
    }>;
    updatePreferences(userId: string, data: {
        channels?: Record<string, unknown>;
        categories?: Record<string, unknown>;
        quietHoursStart?: string;
        quietHoursEnd?: string;
        digestFrequency?: string;
        timezone?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        timezone: string;
        channels: import("@prisma/working-client/runtime/library").JsonValue;
        userId: string;
        categories: import("@prisma/working-client/runtime/library").JsonValue;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
        digestFrequency: import("@prisma/working-client").$Enums.DigestFrequency;
    }>;
    registerPushSubscription(userId: string, data: {
        endpoint: string;
        p256dh?: string;
        auth?: string;
        deviceType?: string;
    }): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        auth: string | null;
        deviceType: string | null;
        endpoint: string;
        p256dh: string | null;
    }>;
    unregisterPushSubscription(userId: string, endpoint: string): Promise<{
        unregistered: number;
    }>;
    getPushSubscriptions(userId: string): Promise<{
        id: string;
        tenantId: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        userId: string;
        auth: string | null;
        deviceType: string | null;
        endpoint: string;
        p256dh: string | null;
    }[]>;
}
