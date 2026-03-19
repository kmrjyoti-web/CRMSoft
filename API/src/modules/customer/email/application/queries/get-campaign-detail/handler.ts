import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCampaignDetailQuery } from './query';

@QueryHandler(GetCampaignDetailQuery)
export class GetCampaignDetailHandler implements IQueryHandler<GetCampaignDetailQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCampaignDetailQuery) {
    const campaign = await this.prisma.emailCampaign.findUnique({
      where: { id: query.campaignId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign ${query.campaignId} not found`);
    }

    return campaign;
  }
}
