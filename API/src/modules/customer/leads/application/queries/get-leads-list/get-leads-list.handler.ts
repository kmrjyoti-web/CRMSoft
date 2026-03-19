// @ts-nocheck
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { buildPaginationParams, buildPaginatedResult } from '../../../../../../common/utils/paginated-list.helper';
import { GetLeadsListQuery } from './get-leads-list.query';

@QueryHandler(GetLeadsListQuery)
export class GetLeadsListHandler implements IQueryHandler<GetLeadsListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetLeadsListQuery) {
    const where: any = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.status) {
      const vals = query.status.split(',').map((v) => v.trim()).filter(Boolean);
      where.status = vals.length === 1 ? vals[0] : { in: vals };
    }
    if (query.priority) {
      const vals = query.priority.split(',').map((v) => v.trim()).filter(Boolean);
      where.priority = vals.length === 1 ? vals[0] : { in: vals };
    }
    if (query.allocatedToId) where.allocatedToId = query.allocatedToId;
    if (query.contactId) where.contactId = query.contactId;
    if (query.organizationId) where.organizationId = query.organizationId;

    if (query.search) {
      where.OR = [
        { leadNumber: { contains: query.search, mode: 'insensitive' } },
        { notes: { contains: query.search, mode: 'insensitive' } },
        {
          contact: {
            OR: [
              { firstName: { contains: query.search, mode: 'insensitive' } },
              { lastName: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        },
        {
          organization: {
            name: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const { page, limit, skip, orderBy } = buildPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          leadNumber: true,
          status: true,
          priority: true,
          expectedValue: true,
          isActive: true,
          createdAt: true,
          contact: {
            select: {
              id: true, firstName: true, lastName: true,
              communications: {
                where: { isPrimary: true },
                select: { type: true, value: true },
                take: 2,
              },
            },
          },
          organization: {
            select: { id: true, name: true },
          },
          allocatedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
