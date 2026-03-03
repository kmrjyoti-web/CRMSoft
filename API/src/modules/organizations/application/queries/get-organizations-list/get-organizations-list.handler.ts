import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetOrganizationsListQuery } from './get-organizations-list.query';

@QueryHandler(GetOrganizationsListQuery)
export class GetOrganizationsListHandler implements IQueryHandler<GetOrganizationsListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrganizationsListQuery) {
    const where: any = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.city) where.city = { contains: query.city, mode: 'insensitive' };
    if (query.industry) where.industry = { contains: query.industry, mode: 'insensitive' };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { gstNumber: { contains: query.search, mode: 'insensitive' } },
        { city: { contains: query.search, mode: 'insensitive' } },
        { website: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          filters: {
            include: {
              lookupValue: { select: { id: true, value: true, label: true } },
            },
          },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { contacts: true, leads: true } },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
