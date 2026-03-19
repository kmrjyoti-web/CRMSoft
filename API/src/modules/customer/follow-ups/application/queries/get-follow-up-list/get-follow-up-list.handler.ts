import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetFollowUpListQuery } from './get-follow-up-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(GetFollowUpListQuery)
export class GetFollowUpListHandler implements IQueryHandler<GetFollowUpListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetFollowUpListQuery) {
    const where: any = { isActive: true };
    if (query.priority) where.priority = query.priority;
    if (query.assignedToId) where.assignedToId = query.assignedToId;
    if (query.isOverdue !== undefined) where.isOverdue = query.isOverdue;
    if (query.entityType) where.entityType = query.entityType;
    if (query.entityId) where.entityId = query.entityId;
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.followUp.findMany({
        where,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.followUp.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
