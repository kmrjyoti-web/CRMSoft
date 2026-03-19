import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { BulkSeedMenusCommand, MenuSeedItem } from './bulk-seed-menus.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(BulkSeedMenusCommand)
export class BulkSeedMenusHandler implements ICommandHandler<BulkSeedMenusCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Reset menus for the current tenant:
   * 1. Delete all existing menus (children before parents to respect FK constraints)
   * 2. Create fresh from MENU_SEED_DATA
   *
   * For regular users, Prisma middleware injects tenantId automatically.
   * For SuperAdmin (no tenant context), we explicitly target the default tenant.
   */
  async execute(cmd: BulkSeedMenusCommand) {
    // Resolve target tenantId — always use an explicit value so we control scoping
    let explicitTenantId: string | undefined;
    if (cmd.isSuperAdmin && !cmd.tenantId) {
      const defaultTenantId = this.config.get<string>('DEFAULT_TENANT_ID');
      if (defaultTenantId) {
        explicitTenantId = defaultTenantId;
      } else {
        const defaultTenant = await this.prisma.tenant.findFirst({ where: { slug: 'default' } });
        explicitTenantId = defaultTenant?.id;
      }
    } else if (cmd.tenantId) {
      explicitTenantId = cmd.tenantId;
    }

    const scopeFilter = explicitTenantId ? { tenantId: explicitTenantId } : {};

    // Step 1: Find all level-2 menu ids so we can delete level-3 first
    const level2Menus = await this.prisma.menu.findMany({
      where: { parentId: { not: null }, ...scopeFilter },
      select: { id: true },
    });
    const level2Ids = level2Menus.map((m) => m.id);

    // Step 2: Delete level-3 (grandchildren)
    if (level2Ids.length > 0) {
      await this.prisma.menu.deleteMany({
        where: { parentId: { in: level2Ids }, ...scopeFilter },
      });
    }

    // Step 3: Delete level-2 (children)
    await this.prisma.menu.deleteMany({
      where: { parentId: { not: null }, ...scopeFilter },
    });

    // Step 4: Delete level-1 (roots)
    await this.prisma.menu.deleteMany({ where: { ...scopeFilter } });

    // Step 5: Create fresh from seed data (3 levels deep)
    let count = 0;
    for (let i = 0; i < cmd.menus.length; i++) {
      const item = cmd.menus[i];
      const parent = await this.createMenu(item, null, i, explicitTenantId);
      count++;

      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          const childMenu = await this.createMenu(child, parent.id, j, explicitTenantId);
          count++;

          if (child.children) {
            for (let k = 0; k < child.children.length; k++) {
              await this.createMenu(child.children[k], childMenu.id, k, explicitTenantId);
              count++;
            }
          }
        }
      }
    }

    return { seeded: count };
  }

  private async createMenu(
    item: MenuSeedItem,
    parentId: string | null,
    sortOrder: number,
    explicitTenantId?: string,
  ) {
    return this.prisma.menu.create({
      data: {
        ...(explicitTenantId ? { tenantId: explicitTenantId } : {}),
        name: item.name,
        code: item.code,
        icon: item.icon,
        route: item.route,
        parentId,
        sortOrder,
        menuType: item.menuType ?? 'ITEM',
        permissionModule: item.permissionModule,
        permissionAction: item.permissionAction ?? (item.permissionModule ? 'read' : undefined),
        badgeColor: item.badgeColor,
        badgeText: item.badgeText,
        openInNewTab: item.openInNewTab ?? false,
        isAdminOnly: item.isAdminOnly ?? false,
      },
    });
  }
}
