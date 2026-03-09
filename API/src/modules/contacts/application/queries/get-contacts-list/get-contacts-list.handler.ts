import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetContactsListQuery } from './get-contacts-list.query';

@QueryHandler(GetContactsListQuery)
export class GetContactsListHandler implements IQueryHandler<GetContactsListQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactsListQuery) {
    const where: any = {};

    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.designation) {
      where.designation = { contains: query.designation, mode: 'insensitive' };
    }
    if (query.department) {
      where.department = { contains: query.department, mode: 'insensitive' };
    }

    // Filter by organization
    if (query.organizationId) {
      where.contactOrganizations = {
        some: {
          organizationId: query.organizationId,
          isActive: true,
        },
      };
    }

    // Search across name + communications
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { designation: { contains: query.search, mode: 'insensitive' } },
        {
          communications: {
            some: {
              value: { contains: query.search, mode: 'insensitive' },
            },
          },
        },
        {
          contactOrganizations: {
            some: {
              organization: {
                name: { contains: query.search, mode: 'insensitive' },
              },
            },
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.contact.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          communications: {
            select: { id: true, type: true, value: true, isPrimary: true, priorityType: true },
            orderBy: { isPrimary: 'desc' },
            take: 5,
          },
          contactOrganizations: {
            where: { isActive: true },
            include: {
              organization: {
                select: { id: true, name: true, city: true },
              },
            },
            take: 2,
          },
          filters: {
            include: {
              lookupValue: { select: { id: true, value: true, label: true } },
            },
          },
          createdByUser: { select: { id: true, firstName: true, lastName: true } },
          _count: { select: { leads: true, communications: true } },
        },
      }),
      this.prisma.contact.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }
}
