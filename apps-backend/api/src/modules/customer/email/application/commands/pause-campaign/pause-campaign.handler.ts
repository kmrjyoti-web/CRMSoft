import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PauseCampaignCommand } from './pause-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';

@CommandHandler(PauseCampaignCommand)
export class PauseCampaignHandler implements ICommandHandler<PauseCampaignCommand> {
  private readonly logger = new Logger(PauseCampaignHandler.name);

  constructor(private readonly campaignExecutor: CampaignExecutorService) {}

  async execute(cmd: PauseCampaignCommand) {
    try {
      await this.campaignExecutor.pauseCampaign(cmd.campaignId);
      this.logger.log(`Campaign paused: ${cmd.campaignId}`);
    } catch (error) {
      this.logger.error(`PauseCampaignHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
