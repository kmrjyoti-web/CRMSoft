import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkSeedMenusCommand, MenuSeedItem } from './bulk-seed-menus.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(BulkSeedMenusCommand)
export class BulkSeedMenusHandler implements ICommandHandler<BulkSeedMenusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /** Bulk upsert menus by code. Handles 2 levels of nesting. */
  async execute(cmd: BulkSeedMenusCommand) {
    let count = 0;
    for (let i = 0; i < cmd.menus.length; i++) {
      const item = cmd.menus[i];
      const parent = await this.upsertMenu(item, null, i);
      count++;

      if (item.children) {
        for (let j = 0; j < item.children.length; j++) {
          const child = item.children[j];
          const childMenu = await this.upsertMenu(child, parent.id, j);
          count++;

          if (child.children) {
            for (let k = 0; k < child.children.length; k++) {
              await this.upsertMenu(child.children[k], childMenu.id, k);
              count++;
            }
          }
        }
      }
    }
    return { seeded: count };
  }

  private async upsertMenu(item: MenuSeedItem, parentId: string | null, sortOrder: number) {
    const existing = await this.prisma.menu.findFirst({
      where: { code: item.code },
    });
    if (existing) {
      return this.prisma.menu.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          icon: item.icon,
          route: item.route,
          parentId,
          sortOrder,
          menuType: item.menuType ?? 'ITEM',
          permissionModule: item.permissionModule,
          permissionAction: item.permissionAction ?? (item.permissionModule ? 'view' : undefined),
          badgeColor: item.badgeColor,
          badgeText: item.badgeText,
          openInNewTab: item.openInNewTab ?? false,
        },
      });
    }
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
        permissionAction: item.permissionAction ?? (item.permissionModule ? 'view' : undefined),
        badgeColor: item.badgeColor,
        badgeText: item.badgeText,
        openInNewTab: item.openInNewTab ?? false,
      },
    });
  }
}
