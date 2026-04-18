import { ICommandHandler } from '@nestjs/cqrs';
import { PauseCampaignCommand } from './pause-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';
export declare class PauseCampaignHandler implements ICommandHandler<PauseCampaignCommand> {
    private readonly campaignExecutor;
    private readonly logger;
    constructor(campaignExecutor: CampaignExecutorService);
    execute(cmd: PauseCampaignCommand): Promise<void>;
}
