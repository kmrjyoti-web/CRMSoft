import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { ListMenuCategoriesQuery } from './list-menu-categories.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(ListMenuCategoriesQuery)
export class ListMenuCategoriesHandler implements IQueryHandler<ListMenuCategoriesQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMenuCategoriesQuery) {
    return this.prisma.identity.customerMenuCategory.findMany({
      where: { tenantId: query.tenantId, isDeleted: false },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { users: { where: { isDeleted: false } } } } },
    });
  }
}
