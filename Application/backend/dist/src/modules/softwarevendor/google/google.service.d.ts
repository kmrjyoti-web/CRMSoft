import { PrismaService } from '../../../core/prisma/prisma.service';
import { CredentialService } from '../../softwarevendor/tenant-config/services/credential.service';
export declare class GoogleService {
    private readonly prisma;
    private readonly credentialService;
    private readonly logger;
    constructor(prisma: PrismaService, credentialService: CredentialService);
    getAuthUrl(tenantId: string, userId: string, services: string[]): Promise<string>;
    handleCallback(tenantId: string, userId: string, code: string, services: string[]): Promise<{
        id: string;
        tenantId: string;
        name: string | null;
        createdAt: Date;
        updatedAt: Date;
        isDeleted: boolean;
        deletedAt: Date | null;
        deletedById: string | null;
        updatedById: string | null;
        updatedByName: string | null;
        email: string;
        userId: string;
        accessToken: string;
        refreshToken: string;
        tokenExpiresAt: Date | null;
        lastSyncAt: Date | null;
        avatarUrl: string | null;
        services: import("@prisma/working-client/runtime/library").JsonValue;
        calendarSettings: import("@prisma/working-client/runtime/library").JsonValue | null;
        contactsSettings: import("@prisma/working-client/runtime/library").JsonValue | null;
    }>;
    getStatus(tenantId: string, userId: string): Promise<{
        isConnected: boolean;
        services: never[];
        email?: undefined;
        name?: undefined;
        avatarUrl?: undefined;
        connectedAt?: undefined;
    } | {
        isConnected: boolean;
        email: string;
        name: string | null;
        avatarUrl: string | null;
        connectedAt: Date;
        services: {
            serviceId: string;
            enabled: boolean;
            lastSyncAt: Date | null;
        }[];
    }>;
    disconnect(tenantId: string, userId: string): Promise<{
        disconnected: boolean;
    }>;
    syncService(tenantId: string, userId: string, serviceId: string): Promise<{
        synced: boolean;
        serviceId: string;
        syncedAt: Date;
    }>;
    getCalendarSettings(tenantId: string, userId: string): Promise<any>;
    updateCalendarSettings(tenantId: string, userId: string, settings: any): Promise<any>;
    getContactsSettings(tenantId: string, userId: string): Promise<any>;
    updateContactsSettings(tenantId: string, userId: string, settings: any): Promise<any>;
    private getClientCredentials;
    private buildScopes;
    private fetchUserProfile;
    private getConnection;
    private ensureFreshToken;
}
