import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@Injectable()
export class PageMenuSyncService {
  private readonly logger = new Logger(PageMenuSyncService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Sync all pages assigned to a module (with showInMenu=true) into the Menu table
   * for ALL tenants that have this module enabled.
   */
  async syncModulePages(moduleCode: string): Promise<{ synced: number; tenants: number }> {
    // Get pages for this module that should appear in menus
    const pages = await this.prisma.platform.pageRegistry.findMany({
      where: { moduleCode, showInMenu: true, isActive: true },
      orderBy: { menuSortOrder: 'asc' },
    });

    if (pages.length === 0) {
      return { synced: 0, tenants: 0 };
    }

    // Get all tenants (we sync menus to all tenants — module access is enforced at runtime)
    const tenants = await this.prisma.identity.tenant.findMany({
      select: { id: true },
    });

    let synced = 0;

    for (const tenant of tenants) {
      for (const page of pages) {
        const menuCode = page.menuKey || `page_${moduleCode}_${page.routePath.replace(/[/:]/g, '_')}`;
        const route = page.routePath.replace(/:(\w+)/g, '[$1]');

        // Find or create parent menu if menuParentKey is set
        let parentId: string | null = null;
        if (page.menuParentKey) {
          const parentMenu = await this.prisma.identity.menu.findFirst({
            where: { tenantId: tenant.id, code: page.menuParentKey },
          });
          parentId = parentMenu?.id || null;
        }

        // Upsert menu item
        const existingMenu = await this.prisma.identity.menu.findFirst({
          where: { tenantId: tenant.id, code: menuCode },
        });

        if (existingMenu) {
          await this.prisma.identity.menu.update({
            where: { id: existingMenu.id },
            data: {
              name: page.menuLabel || page.friendlyName || page.routePath,
              icon: page.menuIcon,
              route,
              sortOrder: page.menuSortOrder,
              parentId,
              isActive: true,
              autoEnableWithModule: moduleCode,
            },
          });
        } else {
          await this.prisma.identity.menu.create({
            data: {
              tenantId: tenant.id,
              code: menuCode,
              name: page.menuLabel || page.friendlyName || page.routePath,
              icon: page.menuIcon,
              route,
              menuType: 'ITEM',
              sortOrder: page.menuSortOrder,
              parentId,
              isActive: true,
              autoEnableWithModule: moduleCode,
            },
          });
        }
        synced++;
      }
    }

    this.logger.log(
      `Synced ${pages.length} pages for module "${moduleCode}" across ${tenants.length} tenants (${synced} menu entries)`,
    );

    return { synced, tenants: tenants.length };
  }
}
