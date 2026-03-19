import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateCampaignCommand } from './create-campaign.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateCampaignCommand)
export class CreateCampaignHandler implements ICommandHandler<CreateCampaignCommand> {
  private readonly logger = new Logger(CreateCampaignHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateCampaignCommand) {
    const campaign = await this.prisma.working.emailCampaign.create({
      data: {
        name: cmd.name,
        description: cmd.description,
        subject: cmd.subject,
        bodyHtml: cmd.bodyHtml,
        bodyText: cmd.bodyText,
        accountId: cmd.accountId,
        fromName: cmd.fromName,
        replyToEmail: cmd.replyToEmail,
        templateId: cmd.templateId,
        sendRatePerMinute: cmd.sendRatePerMinute ?? 60,
        batchSize: cmd.batchSize ?? 100,
        trackOpens: cmd.trackOpens ?? true,
        trackClicks: cmd.trackClicks ?? true,
        includeUnsubscribe: cmd.includeUnsubscribe ?? true,
        scheduledAt: cmd.scheduledAt,
        status: 'DRAFT',
        createdById: cmd.userId,
        createdByName: cmd.userName,
      },
    });

    this.logger.log(`Email campaign created: ${campaign.id} (${cmd.name})`);
    return campaign;
  }
}
