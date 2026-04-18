import { IQueryHandler } from '@nestjs/cqrs';
import { GetCloudConnectionsQuery } from './get-cloud-connections.query';
import { CloudProviderService } from '../../../services/cloud-provider.service';
export declare class GetCloudConnectionsHandler implements IQueryHandler<GetCloudConnectionsQuery> {
    private readonly cloudProvider;
    private readonly logger;
    constructor(cloudProvider: CloudProviderService);
    execute(query: GetCloudConnectionsQuery): Promise<{
        id: string;
        createdAt: Date;
        status: import("@prisma/working-client").$Enums.CloudConnectionStatus;
        provider: import("@prisma/working-client").$Enums.StorageProvider;
        lastSyncAt: Date | null;
        accountEmail: string | null;
        accountName: string | null;
    }[]>;
}
