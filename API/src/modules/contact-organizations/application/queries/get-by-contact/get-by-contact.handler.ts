import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetOrgsByContactQuery } from './get-by-contact.query';

@QueryHandler(GetOrgsByContactQuery)
export class GetOrgsByContactHandler implements IQueryHandler<GetOrgsByContactQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetOrgsByContactQuery) {
    const where: any = { contactId: query.contactId };
    if (query.activeOnly !== false) where.isActive = true;

    return this.prisma.contactOrganization.findMany({
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
  }
}
