import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateMenuCommand } from './create-menu.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateMenuCommand)
export class CreateMenuHandler implements ICommandHandler<CreateMenuCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /** Create a new menu item. Auto-generates code from name if not provided. */
  async execute(cmd: CreateMenuCommand) {
    const name = cmd.name.trim();
    const code = cmd.code?.trim().toUpperCase()
      || name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/(^_|_$)/g, '');

    // Check uniqueness
    const existing = await this.prisma.menu.findFirst({ where: { code } });
    if (existing) {
      throw new ConflictException(`Menu with code "${code}" already exists`);
    }

    // Validate parent
    if (cmd.parentId) {
      const parent = await this.prisma.menu.findUnique({ where: { id: cmd.parentId } });
      if (!parent) throw new NotFoundException('Parent menu not found');
    }

    return this.prisma.menu.create({
      data: {
        name,
        code,
        icon: cmd.icon,
        route: cmd.route,
        parentId: cmd.parentId,
        sortOrder: cmd.sortOrder ?? 0,
        menuType: cmd.menuType ?? 'ITEM',
        permissionModule: cmd.permissionModule,
        permissionAction: cmd.permissionAction ?? (cmd.permissionModule ? 'view' : undefined),
        badgeColor: cmd.badgeColor,
        badgeText: cmd.badgeText,
        openInNewTab: cmd.openInNewTab ?? false,
      },
    });
  }
}
