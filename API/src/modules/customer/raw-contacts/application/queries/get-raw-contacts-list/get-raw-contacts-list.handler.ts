import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { PrismaFilterBuilder } from '../../../../../../common/utils/filter-builder';
import { buildPaginationParams, buildPaginatedResult } from '../../../../../../common/utils/paginated-list.helper';
import { GetRawContactsListQuery } from './get-raw-contacts-list.query';

@QueryHandler(GetRawContactsListQuery)
export class GetRawContactsListHandler implements IQueryHandler<GetRawContactsListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /** Split comma-separated query param into array (or undefined). */
  private csvToArray(value?: string): string[] | undefined {
    if (!value) return undefined;
    return value.split(',').map((v) => v.trim()).filter(Boolean);
  }

  async execute(query: GetRawContactsListQuery) {
    const statuses = this.csvToArray(query.status);
    const sources = this.csvToArray(query.source);

    const where = new PrismaFilterBuilder()
      .exact('isActive', query.isActive)
      .inArray('status', statuses)
      .inArray('source', sources)
      .textContains('companyName', query.companyName)
      .textContains('firstName', query.firstName)
      .textContains('lastName', query.lastName)
      .dateRange('createdAt', query.createdAtFrom, query.createdAtTo)
      .search(query.search, [
        'firstName',
        'lastName',
        'companyName',
        {
          communications: {
            some: {
              value: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
      ])
      .build();

    const { page, limit, skip, orderBy } = buildPaginationParams(query);

    const [data, total] = await Promise.all([
      this.prisma.rawContact.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
          designation: true,
          department: true,
          source: true,
          status: true,
          isActive: true,
          entityVerificationStatus: true,
          createdAt: true,
          communications: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true, type: true, value: true, isPrimary: true,
            },
          },
        },
      }),
      this.prisma.rawContact.count({ where }),
    ]);

    return buildPaginatedResult(data, total, page, limit);
  }
}
