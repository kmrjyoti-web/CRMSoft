import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Injectable, Logger } from '@nestjs/common';
import { GetRequirementQuotesQuery } from './get-requirement-quotes.query';
import { MktPrismaService } from '../../../infrastructure/mkt-prisma.service';

@QueryHandler(GetRequirementQuotesQuery)
@Injectable()
export class GetRequirementQuotesHandler implements IQueryHandler<GetRequirementQuotesQuery> {
    private readonly logger = new Logger(GetRequirementQuotesHandler.name);

  constructor(private readonly mktPrisma: MktPrismaService) {}

  async execute(query: GetRequirementQuotesQuery) {
    try {
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
    } catch (error) {
      this.logger.error(`GetRequirementQuotesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
