import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetContactsByOrgQuery } from './get-by-organization.query';

@QueryHandler(GetContactsByOrgQuery)
export class GetContactsByOrgHandler implements IQueryHandler<GetContactsByOrgQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetContactsByOrgQuery) {
    const where: any = { organizationId: query.organizationId };
    if (query.activeOnly !== false) where.isActive = true;

    return this.prisma.contactOrganization.findMany({
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
  }
}
