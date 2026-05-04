import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { AddCampaignRecipientsCommand } from './add-campaign-recipients.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(AddCampaignRecipientsCommand)
export class AddCampaignRecipientsHandler implements ICommandHandler<AddCampaignRecipientsCommand> {
  private readonly logger = new Logger(AddCampaignRecipientsHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AddCampaignRecipientsCommand) {
    try {
      // Create recipient records
      await this.prisma.working.campaignRecipient.createMany({
        data: cmd.recipients.map((r) => ({
          campaignId: cmd.campaignId,
          email: r.email,
          firstName: r.firstName,
          lastName: r.lastName,
          companyName: r.companyName,
          contactId: r.contactId,
          mergeData: r.mergeData || {},
          status: 'PENDING',
        })),
      });

      // Update totalRecipients on campaign
      const count = await this.prisma.working.campaignRecipient.count({
        where: { campaignId: cmd.campaignId },
      });

      await this.prisma.working.emailCampaign.update({
        where: { id: cmd.campaignId },
        data: { totalRecipients: count },
      });

      this.logger.log(`Added ${cmd.recipients.length} recipients to campaign ${cmd.campaignId} (total: ${count})`);
      return { added: cmd.recipients.length, total: count };
    } catch (error) {
      this.logger.error(`AddCampaignRecipientsHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
