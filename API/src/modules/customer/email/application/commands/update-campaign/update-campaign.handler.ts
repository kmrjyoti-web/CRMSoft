import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, Logger } from '@nestjs/common';
import { UpdateCampaignCommand } from './update-campaign.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateCampaignCommand)
export class UpdateCampaignHandler implements ICommandHandler<UpdateCampaignCommand> {
  private readonly logger = new Logger(UpdateCampaignHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateCampaignCommand) {
    const campaign = await this.prisma.emailCampaign.findUniqueOrThrow({
      where: { id: cmd.id },
    });

    if (campaign.status !== 'DRAFT') {
      throw new BadRequestException(`Campaign can only be updated in DRAFT status, current status: ${campaign.status}`);
    }

    const data: Record<string, any> = {};
    if (cmd.name !== undefined) data.name = cmd.name;
    if (cmd.description !== undefined) data.description = cmd.description;
    if (cmd.subject !== undefined) data.subject = cmd.subject;
    if (cmd.bodyHtml !== undefined) data.bodyHtml = cmd.bodyHtml;
    if (cmd.bodyText !== undefined) data.bodyText = cmd.bodyText;
    if (cmd.sendRatePerMinute !== undefined) data.sendRatePerMinute = cmd.sendRatePerMinute;
    if (cmd.scheduledAt !== undefined) data.scheduledAt = cmd.scheduledAt;

    const updated = await this.prisma.emailCampaign.update({
      where: { id: cmd.id },
      data,
    });

    this.logger.log(`Email campaign updated: ${cmd.id}`);
    return updated;
  }
}
