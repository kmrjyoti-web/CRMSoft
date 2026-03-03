import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { PrismaFilterBuilder } from '../../../../../common/utils/filter-builder';
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

    const [data, total] = await Promise.all([
      this.prisma.rawContact.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          communications: {
            orderBy: { createdAt: 'asc' },
            select: {
              id: true, type: true, value: true, priorityType: true,
              isPrimary: true, label: true,
            },
          },
          filters: {
            include: {
              lookupValue: { select: { id: true, value: true, label: true } },
            },
          },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { communications: true } },
        },
      }),
      this.prisma.rawContact.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
