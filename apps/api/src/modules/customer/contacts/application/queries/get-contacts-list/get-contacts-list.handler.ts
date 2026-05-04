import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { buildPaginationParams, buildPaginatedResult } from '../../../../../../common/utils/paginated-list.helper';
import { GetContactsListQuery } from './get-contacts-list.query';

@QueryHandler(GetContactsListQuery)
export class GetContactsListHandler implements IQueryHandler<GetContactsListQuery> {
    private readonly logger = new Logger(GetContactsListHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactsListQuery) {
    try {
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

      const { page, limit, skip, orderBy } = buildPaginationParams(query);

      const [data, total] = await Promise.all([
        this.prisma.working.contact.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            designation: true,
            department: true,
            dataStatus: true,
            isActive: true,
            entityVerificationStatus: true,
            createdAt: true,
            communications: {
              select: { id: true, type: true, value: true, isPrimary: true },
              orderBy: { isPrimary: 'desc' },
              take: 3,
            },
            contactOrganizations: {
              where: { isActive: true },
              select: {
                organization: {
                  select: { id: true, name: true },
                },
              },
              take: 1,
            },
          },
        }),
        this.prisma.working.contact.count({ where }),
      ]);

      return buildPaginatedResult(data, total, page, limit);
    } catch (error) {
      this.logger.error(`GetContactsListHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
