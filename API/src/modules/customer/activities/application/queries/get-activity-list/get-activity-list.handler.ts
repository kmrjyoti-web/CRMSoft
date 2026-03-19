import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetActivityListQuery } from './get-activity-list.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { buildPaginationParams, buildPaginatedResult } from '../../../../../../common/utils/paginated-list.helper';

@QueryHandler(GetActivityListQuery)
export class GetActivityListHandler implements IQueryHandler<GetActivityListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetActivityListQuery) {
    const where: any = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.type) where.type = query.type;
    if (query.leadId) where.leadId = query.leadId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.createdById) where.createdById = query.createdById;
    if (query.search) {
      where.OR = [
        { subject: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.fromDate || query.toDate) {
      where.scheduledAt = {};
      if (query.fromDate) where.scheduledAt.gte = new Date(query.fromDate);
      if (query.toDate) where.scheduledAt.lte = new Date(query.toDate);
    }

    const { page, limit, skip, orderBy } = buildPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.activity.findMany({
        where,
        include: { lead: { select: { id: true, leadNumber: true } }, contact: { select: { id: true, firstName: true, lastName: true } }, createdByUser: { select: { id: true, firstName: true, lastName: true } } },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.activity.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
