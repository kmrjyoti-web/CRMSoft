import { ICommandHandler } from '@nestjs/cqrs';
import { StartCampaignCommand } from './start-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';
export declare class StartCampaignHandler implements ICommandHandler<StartCampaignCommand> {
    private readonly campaignExecutor;
    private readonly logger;
    constructor(campaignExecutor: CampaignExecutorService);
    execute(cmd: StartCampaignCommand): Promise<void>;
}
