import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { StartCampaignCommand } from './start-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';

@CommandHandler(StartCampaignCommand)
export class StartCampaignHandler implements ICommandHandler<StartCampaignCommand> {
  private readonly logger = new Logger(StartCampaignHandler.name);

  constructor(private readonly campaignExecutor: CampaignExecutorService) {}

  async execute(cmd: StartCampaignCommand) {
    await this.campaignExecutor.executeCampaign(cmd.campaignId);
    this.logger.log(`Campaign started: ${cmd.campaignId} by user ${cmd.userId}`);
  }
}
