import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ListMenuCategoriesQuery } from './list-menu-categories.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(ListMenuCategoriesQuery)
export class ListMenuCategoriesHandler implements IQueryHandler<ListMenuCategoriesQuery> {
    private readonly logger = new Logger(ListMenuCategoriesHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: ListMenuCategoriesQuery) {
    try {
      return this.prisma.identity.customerMenuCategory.findMany({
        where: { tenantId: query.tenantId, isDeleted: false },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: { _count: { select: { users: { where: { isDeleted: false } } } } },
      });
    } catch (error) {
      this.logger.error(`ListMenuCategoriesHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
