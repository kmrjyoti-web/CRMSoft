// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetDemosByLeadQuery } from './get-demos-by-lead.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetDemosByLeadQuery)
export class GetDemosByLeadHandler implements IQueryHandler<GetDemosByLeadQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetDemosByLeadQuery) {
    const where = { leadId: query.leadId };
    const [data, total] = await Promise.all([
      this.prisma.working.demo.findMany({
        where,
        include: { conductedBy: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { scheduledAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.working.demo.count({ where }),
    ]);
    return { data, total, page: query.page, limit: query.limit };
  }
}
