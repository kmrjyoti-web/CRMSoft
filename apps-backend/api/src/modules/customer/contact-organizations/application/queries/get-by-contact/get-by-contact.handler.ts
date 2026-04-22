import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { GetOrgsByContactQuery } from './get-by-contact.query';

@QueryHandler(GetOrgsByContactQuery)
export class GetOrgsByContactHandler implements IQueryHandler<GetOrgsByContactQuery> {
    private readonly logger = new Logger(GetOrgsByContactHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrgsByContactQuery) {
    try {
      const where: any = { contactId: query.contactId };
      if (query.activeOnly !== false) where.isActive = true;

      return this.prisma.working.contactOrganization.findMany({
        where,
        orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        include: {
          organization: {
            select: {
              id: true, name: true, city: true, industry: true,
              isActive: true,
            },
          },
        },
      });
    } catch (error) {
      this.logger.error(`GetOrgsByContactHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
