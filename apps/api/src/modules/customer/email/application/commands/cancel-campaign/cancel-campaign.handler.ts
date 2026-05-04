import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CancelCampaignCommand } from './cancel-campaign.command';
import { CampaignExecutorService } from '../../../services/campaign-executor.service';

@CommandHandler(CancelCampaignCommand)
export class CancelCampaignHandler implements ICommandHandler<CancelCampaignCommand> {
  private readonly logger = new Logger(CancelCampaignHandler.name);

  constructor(private readonly campaignExecutor: CampaignExecutorService) {}

  async execute(cmd: CancelCampaignCommand) {
    try {
      await this.campaignExecutor.cancelCampaign(cmd.campaignId);
      this.logger.log(`Campaign cancelled: ${cmd.campaignId}`);
    } catch (error) {
      this.logger.error(`CancelCampaignHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
