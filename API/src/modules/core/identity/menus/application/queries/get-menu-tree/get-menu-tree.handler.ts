import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { GetMenuTreeQuery } from './get-menu-tree.query';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';
import { industryFilter } from '../../../../../../../common/utils/industry-filter.util';

const MENU_SELECT = {
  id: true, name: true, code: true, icon: true, route: true,
  menuType: true, sortOrder: true, permissionModule: true,
  permissionAction: true, isActive: true, badgeColor: true,
  badgeText: true, openInNewTab: true, parentId: true,
};

@QueryHandler(GetMenuTreeQuery)
export class GetMenuTreeHandler implements IQueryHandler<GetMenuTreeQuery> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /** Return full admin menu tree (3 levels, includes inactive). */
  async execute(query: GetMenuTreeQuery) {
    const childOrder = { orderBy: { sortOrder: 'asc' as const } };

    // Always resolve an explicit tenantId to prevent returning menus from all tenants.
    // For regular users the Prisma middleware ALSO adds tenantId, but we add it
    // explicitly here as a safety net (belt + suspenders).
    const tenantFilter: Record<string, unknown> = {};
    if (query.tenantId) {
      tenantFilter.tenantId = query.tenantId;
    } else if (query.isSuperAdmin) {
      const defaultTenantId = this.config.get<string>('DEFAULT_TENANT_ID');
      let targetId = defaultTenantId;
      if (!targetId) {
        const defaultTenant = await this.prisma.tenant.findFirst({ where: { slug: 'default' } });
        targetId = defaultTenant?.id;
      }
      if (targetId) {
        tenantFilter.tenantId = targetId;
      }
    }

    return this.prisma.menu.findMany({
      where: { parentId: null, ...tenantFilter, ...industryFilter(query.industryCode) } as any,
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
