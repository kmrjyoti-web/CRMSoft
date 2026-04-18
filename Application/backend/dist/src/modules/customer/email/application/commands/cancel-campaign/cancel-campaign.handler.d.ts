import { ICommandHandler } from '@nestjs/cqrs';
import { CancelCampaignCommand } from './cancel-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';
export declare class CancelCampaignHandler implements ICommandHandler<CancelCampaignCommand> {
    private readonly campaignExecutor;
    private readonly logger;
    constructor(campaignExecutor: CampaignExecutorService);
    execute(cmd: CancelCampaignCommand): Promise<void>;
}
