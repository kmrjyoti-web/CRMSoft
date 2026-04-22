import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetContactsByOrgQuery } from './get-by-organization.query';

@QueryHandler(GetContactsByOrgQuery)
export class GetContactsByOrgHandler implements IQueryHandler<GetContactsByOrgQuery> {
    private readonly logger = new Logger(GetContactsByOrgHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactsByOrgQuery) {
    try {
      const where: any = { organizationId: query.organizationId };
      if (query.activeOnly !== false) where.isActive = true;

      return this.prisma.working.contactOrganization.findMany({
        where,
        orderBy: [{ isPrimary: 'desc' }, { relationType: 'asc' }, { createdAt: 'asc' }],
        include: {
          contact: {
            select: {
              id: true, firstName: true, lastName: true,
              designation: true, isActive: true,
              communications: {
                where: { isPrimary: true },
                select: { type: true, value: true },
                take: 3,
              },
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`GetContactsByOrgHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
