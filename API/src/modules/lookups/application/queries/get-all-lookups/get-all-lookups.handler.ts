import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { GetAllLookupsQuery } from './get-all-lookups.query';

@QueryHandler(GetAllLookupsQuery)
export class GetAllLookupsHandler implements IQueryHandler<GetAllLookupsQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetAllLookupsQuery) {
    const where: any = {};
    if (query.activeOnly !== false) where.isActive = true;

    return this.prisma.masterLookup.findMany({
      where,
      orderBy: { category: 'asc' },
      include: {
        _count: { select: { values: true } },
      },
    });
  }
}
