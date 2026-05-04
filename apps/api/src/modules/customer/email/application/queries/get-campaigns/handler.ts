import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetCampaignsQuery } from './query';

@QueryHandler(GetCampaignsQuery)
export class GetCampaignsHandler implements IQueryHandler<GetCampaignsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetCampaignsQuery) {
    const where: any = { userId: query.userId };

    if (query.status) where.status = query.status;

    const [data, total] = await Promise.all([
      this.prisma.working.emailCampaign.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.working.emailCampaign.count({ where }),
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
