import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { GetRequirementQuotesQuery } from './get-requirement-quotes.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetRequirementQuotesQuery)
@Injectable()
export class GetRequirementQuotesHandler implements IQueryHandler<GetRequirementQuotesQuery> {
  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetRequirementQuotesQuery) {
    const { requirementId, tenantId, page, limit } = query;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.mktPrisma.client.mktRequirementQuote.findMany({
        where: { requirementId, tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
      }),
      this.mktPrisma.client.mktRequirementQuote.count({
        where: { requirementId, tenantId },
      }),
    ]);

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
