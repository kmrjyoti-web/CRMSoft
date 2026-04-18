import { StorageProvider } from '@prisma/working-client';
import { PrismaService } from '../../../../core/prisma/prisma.service';
export interface CloudFileMetadata {
    fileId: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    webViewUrl: string;
    thumbnailUrl?: string;
    lastModified?: Date;
}
export declare class CloudProviderService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getFileMetadata(userId: string, provider: StorageProvider, fileId: string): Promise<CloudFileMetadata>;
    connectProvider(userId: string, provider: StorageProvider, accessToken: string, refreshToken?: string, tokenExpiry?: Date, accountEmail?: string, accountName?: string): Promise<{
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
        status: import("@prisma/working-client").$Enums.CloudConnectionStatus;
        userId: string;
        accessToken: string;
        refreshToken: string | null;
        provider: import("@prisma/working-client").$Enums.StorageProvider;
        lastSyncAt: Date | null;
        tokenExpiry: Date | null;
        accountEmail: string | null;
        accountName: string | null;
    }>;
    disconnectProvider(userId: string, provider: StorageProvider): Promise<import("@prisma/working-client").Prisma.BatchPayload>;
    getConnections(userId: string): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/working-client").$Enums.CloudConnectionStatus;
        provider: import("@prisma/working-client").$Enums.StorageProvider;
        lastSyncAt: Date | null;
        accountEmail: string | null;
        accountName: string | null;
    }[]>;
    private getConnection;
    private getGoogleDriveMetadata;
    private getOneDriveMetadata;
    private getDropboxMetadata;
}
