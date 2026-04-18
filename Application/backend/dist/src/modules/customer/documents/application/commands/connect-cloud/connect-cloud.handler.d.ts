import { ICommandHandler } from '@nestjs/cqrs';
import { ConnectCloudCommand } from './connect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';
export declare class ConnectCloudHandler implements ICommandHandler<ConnectCloudCommand> {
    private readonly cloudProvider;
    private readonly logger;
    constructor(cloudProvider: CloudProviderService);
    execute(command: ConnectCloudCommand): Promise<{
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
}
