import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCampaignRecipientsQuery } from './query';

@QueryHandler(GetCampaignRecipientsQuery)
export class GetCampaignRecipientsHandler implements IQueryHandler<GetCampaignRecipientsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCampaignRecipientsQuery) {
    const where: any = { campaignId: query.campaignId };

    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.working.campaignRecipient.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.campaignRecipient.count({ where }),
    ]);

    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
