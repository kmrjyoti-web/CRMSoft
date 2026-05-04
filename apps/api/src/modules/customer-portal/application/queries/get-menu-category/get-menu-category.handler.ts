import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { GetMenuCategoryQuery } from './get-menu-category.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@QueryHandler(GetMenuCategoryQuery)
export class GetMenuCategoryHandler implements IQueryHandler<GetMenuCategoryQuery> {
    private readonly logger = new Logger(GetMenuCategoryHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetMenuCategoryQuery) {
    try {
      const category = await this.prisma.identity.customerMenuCategory.findFirst({
        where: { id: query.id, isDeleted: false },
        include: { _count: { select: { users: { where: { isDeleted: false } } } } },
      });
      if (!category) throw new NotFoundException('Menu category not found');
      return category;
    } catch (error) {
      this.logger.error(`GetMenuCategoryHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
