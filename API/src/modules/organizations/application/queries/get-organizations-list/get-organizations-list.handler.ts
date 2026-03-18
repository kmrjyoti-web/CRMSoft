import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { buildPaginationParams, buildPaginatedResult } from '../../../../../common/utils/paginated-list.helper';
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

    const { page, limit, skip, orderBy } = buildPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          city: true,
          industry: true,
          gstNumber: true,
          website: true,
          isActive: true,
          entityVerificationStatus: true,
          createdAt: true,
          communications: {
            select: { id: true, type: true, value: true, isPrimary: true },
            orderBy: { isPrimary: 'desc' },
            take: 3,
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
