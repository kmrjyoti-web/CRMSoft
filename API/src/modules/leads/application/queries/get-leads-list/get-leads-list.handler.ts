import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
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

    const [data, total] = await Promise.all([
      this.prisma.lead.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          contact: {
            select: {
              id: true, firstName: true, lastName: true, designation: true,
              communications: {
                where: { isPrimary: true },
                select: { type: true, value: true },
                take: 2,
              },
            },
          },
          organization: {
            select: { id: true, name: true, city: true },
          },
          allocatedTo: {
            select: { id: true, firstName: true, lastName: true },
          },
          filters: {
            include: {
              lookupValue: { select: { id: true, value: true, label: true } },
            },
          },
          _count: { select: { activities: true, demos: true, quotations: true } },
        },
      }),
      this.prisma.lead.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
