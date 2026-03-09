import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkSeedMenusCommand, MenuSeedItem } from './bulk-seed-menus.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(BulkSeedMenusCommand)
export class BulkSeedMenusHandler implements ICommandHandler<BulkSeedMenusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Reset menus for the current tenant:
   * 1. Delete all existing menus (children before parents to respect FK constraints)
   * 2. Create fresh from MENU_SEED_DATA
   *
   * Prisma middleware injects tenantId into all queries automatically.
   */
  async execute(cmd: BulkSeedMenusCommand) {
    // Step 1: Find all level-2 menu ids so we can delete level-3 first
    const level2Menus = await this.prisma.menu.findMany({
      where: { parentId: { not: null } },
      select: { id: true },
    });
    const level2Ids = level2Menus.map((m) => m.id);

    // Step 2: Delete level-3 (grandchildren)
    if (level2Ids.length > 0) {
      await this.prisma.menu.deleteMany({
        where: { parentId: { in: level2Ids } },
      });
    }

    // Step 3: Delete level-2 (children)
    await this.prisma.menu.deleteMany({
      where: { parentId: { not: null } },
    });

    // Step 4: Delete level-1 (roots) — middleware scopes to current tenant
    await this.prisma.menu.deleteMany({ where: {} });

    // Step 5: Create fresh from seed data (3 levels deep)
    let count = 0;
    for (let i = 0; i < cmd.menus.length; i++) {
      const item = cmd.menus[i];
      const parent = await this.createMenu(item, null, i);
      count++;

      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          const childMenu = await this.createMenu(child, parent.id, j);
          count++;

          if (child.children) {
            for (let k = 0; k < child.children.length; k++) {
              await this.createMenu(child.children[k], childMenu.id, k);
              count++;
            }
          }
        }
      }
    }

    return { seeded: count };
  }

  private async createMenu(item: MenuSeedItem, parentId: string | null, sortOrder: number) {
    return this.prisma.menu.create({
      data: {
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
      },
    });
  }
}
