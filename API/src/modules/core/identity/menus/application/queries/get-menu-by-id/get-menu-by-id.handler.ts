import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { GetMenuByIdQuery } from './get-menu-by-id.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@QueryHandler(GetMenuByIdQuery)
export class GetMenuByIdHandler implements IQueryHandler<GetMenuByIdQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /** Return a single menu with parent info and direct children. */
  async execute(query: GetMenuByIdQuery) {
    const menu = await this.prisma.menu.findUnique({
      where: { id: query.id },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: {
          select: {
            id: true, name: true, code: true, icon: true, route: true,
            menuType: true, sortOrder: true, isActive: true,
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }
}
