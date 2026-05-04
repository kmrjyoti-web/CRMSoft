import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { UpdateMenuCommand } from './update-menu.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateMenuCommand)
export class UpdateMenuHandler implements ICommandHandler<UpdateMenuCommand> {
    private readonly logger = new Logger(UpdateMenuHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Update a menu item. Prevents circular parent references. */
  async execute(cmd: UpdateMenuCommand) {
    try {
      const menu = await this.prisma.identity.menu.findUnique({ where: { id: cmd.id } });
      if (!menu) throw new NotFoundException('Menu not found');

      // Validate parent change — prevent circular reference
      if (cmd.data.parentId && cmd.data.parentId !== menu.parentId) {
        if (cmd.data.parentId === cmd.id) {
          throw new BadRequestException('Menu cannot be its own parent');
        }
        const parent = await this.prisma.identity.menu.findUnique({ where: { id: cmd.data.parentId } });
        if (!parent) throw new NotFoundException('Parent menu not found');
        // Check if new parent is a descendant of this menu
        if (await this.isDescendant(cmd.data.parentId, cmd.id)) {
          throw new BadRequestException('Circular reference: target parent is a descendant');
        }
      }

      return this.prisma.identity.menu.update({ where: { id: cmd.id }, data: cmd.data });
    } catch (error) {
      this.logger.error(`UpdateMenuHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
}

  /** Check if childId is a descendant of ancestorId. */
  private async isDescendant(childId: string, ancestorId: string): Promise<boolean> {
    let current = await this.prisma.identity.menu.findUnique({
      where: { id: childId }, select: { parentId: true },
    });
    while (current?.parentId) {
      if (current.parentId === ancestorId) return true;
      current = await this.prisma.identity.menu.findUnique({
        where: { id: current.parentId }, select: { parentId: true },
      });
    }
    return false;
  }
}
