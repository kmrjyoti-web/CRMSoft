import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAssignmentRulesQuery } from './get-assignment-rules.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetAssignmentRulesQuery)
export class GetAssignmentRulesHandler implements IQueryHandler<GetAssignmentRulesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAssignmentRulesQuery) {
    const where: any = { isActive: true };
    if (query.entityType) where.entityType = query.entityType;
    if (query.status) where.status = query.status;

    const page = query.page || 1;
    const limit = query.limit || 20;

    const [data, total] = await Promise.all([
      this.prisma.working.assignmentRule.findMany({
        where, orderBy: { priority: 'asc' },
        skip: (page - 1) * limit, take: limit,
      }),
      this.prisma.working.assignmentRule.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
