import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetMenuTreeQuery } from './get-menu-tree.query';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

const MENU_SELECT = {
  id: true, name: true, code: true, icon: true, route: true,
  menuType: true, sortOrder: true, permissionModule: true,
  permissionAction: true, isActive: true, badgeColor: true,
  badgeText: true, openInNewTab: true, parentId: true,
};

@QueryHandler(GetMenuTreeQuery)
export class GetMenuTreeHandler implements IQueryHandler<GetMenuTreeQuery> {
  constructor(private readonly prisma: PrismaService) {}

  /** Return full admin menu tree (3 levels, includes inactive). */
  async execute(query: GetMenuTreeQuery) {
    const childOrder = { orderBy: { sortOrder: 'asc' as const } };

    return this.prisma.menu.findMany({
      where: { parentId: null },
      select: {
        ...MENU_SELECT,
        _count: { select: { children: true } },
        children: {
          select: {
            ...MENU_SELECT,
            _count: { select: { children: true } },
            children: {
              select: { ...MENU_SELECT, _count: { select: { children: true } } },
              ...childOrder,
            },
          },
          ...childOrder,
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }
}
