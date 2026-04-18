import { ICommandHandler } from '@nestjs/cqrs';
import { DisconnectCloudCommand } from './disconnect-cloud.command';
import { CloudProviderService } from '../../../services/cloud-provider.service';
export declare class DisconnectCloudHandler implements ICommandHandler<DisconnectCloudCommand> {
    private readonly cloudProvider;
    private readonly logger;
    constructor(cloudProvider: CloudProviderService);
    execute(command: DisconnectCloudCommand): Promise<{
        success: boolean;
    }>;
}
