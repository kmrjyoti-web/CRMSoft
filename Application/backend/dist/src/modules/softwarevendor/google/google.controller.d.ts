import { ApiResponse } from '../../../common/utils/api-response';
import { GoogleService } from './google.service';
export declare class GoogleController {
    private readonly googleService;
    constructor(googleService: GoogleService);
    initiateAuth(body: {
        services: string[];
    }, userId: string, tenantId: string): Promise<ApiResponse<{
        authUrl: string;
    }>>;
    handleCallback(body: {
        code: string;
        services: string[];
    }, userId: string, tenantId: string): Promise<ApiResponse<{
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
    }>>;
    getStatus(userId: string, tenantId: string): Promise<ApiResponse<{
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
    }>>;
    disconnect(userId: string, tenantId: string): Promise<ApiResponse<{
        disconnected: boolean;
    }>>;
    syncService(service: string, userId: string, tenantId: string): Promise<ApiResponse<{
        synced: boolean;
        serviceId: string;
        syncedAt: Date;
    }>>;
    getCalendarSettings(userId: string, tenantId: string): Promise<ApiResponse<any>>;
    updateCalendarSettings(body: {
        syncDirection: string;
        syncFrequencyMinutes: number;
    }, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    getContactsSettings(userId: string, tenantId: string): Promise<ApiResponse<any>>;
    updateContactsSettings(body: {
        syncDirection: string;
        conflictResolution: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<any>>;
}
