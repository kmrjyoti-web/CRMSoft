// @ts-nocheck
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ListSavedFiltersQuery } from './list-saved-filters.query';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@QueryHandler(ListSavedFiltersQuery)
export class ListSavedFiltersHandler implements IQueryHandler<ListSavedFiltersQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListSavedFiltersQuery) {
    const where: any = {
      isDeleted: false,
      OR: [
        { createdById: query.userId },
        { isShared: true },
      ],
    };
    if (query.entityType) where.entityType = query.entityType;
    if (query.search) where.name = { contains: query.search, mode: 'insensitive' };

    const page = Math.max(1, +query.page);
    const limit = Math.min(100, Math.max(1, +query.limit));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.working.savedFilter.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.working.savedFilter.count({ where }),
    ]);

    return { data, total, page, limit };
  }
}
