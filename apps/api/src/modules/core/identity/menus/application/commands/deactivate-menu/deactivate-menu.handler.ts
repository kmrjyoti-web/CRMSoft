import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeactivateMenuCommand } from './deactivate-menu.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(DeactivateMenuCommand)
export class DeactivateMenuHandler implements ICommandHandler<DeactivateMenuCommand> {
    private readonly logger = new Logger(DeactivateMenuHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Deactivate a menu and cascade to all descendants. */
  async execute(cmd: DeactivateMenuCommand) {
    try {
      const menu = await this.prisma.identity.menu.findUnique({ where: { id: cmd.id } });
      if (!menu) throw new NotFoundException('Menu not found');

      const idsToDeactivate = await this.collectDescendantIds(cmd.id);
      idsToDeactivate.push(cmd.id);

      await this.prisma.identity.menu.updateMany({
        where: { id: { in: idsToDeactivate } },
        data: { isActive: false },
      });

      return { deactivated: idsToDeactivate.length };
    } catch (error) {
      this.logger.error(`DeactivateMenuHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
}

  /** Recursively collect all descendant IDs. */
  private async collectDescendantIds(parentId: string): Promise<string[]> {
    const children = await this.prisma.identity.menu.findMany({
      where: { parentId }, select: { id: true },
    });
    const ids: string[] = [];
    for (const child of children) {
      ids.push(child.id);
      ids.push(...(await this.collectDescendantIds(child.id)));
    }
    return ids;
  }
}
