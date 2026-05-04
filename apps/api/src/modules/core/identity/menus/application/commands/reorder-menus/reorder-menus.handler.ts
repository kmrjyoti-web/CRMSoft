import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ReorderMenusCommand } from './reorder-menus.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(ReorderMenusCommand)
export class ReorderMenusHandler implements ICommandHandler<ReorderMenusCommand> {
    private readonly logger = new Logger(ReorderMenusHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  /** Reorder menu items by updating sortOrder in a transaction. */
  async execute(cmd: ReorderMenusCommand) {
    try {
      const updates = cmd.orderedIds.map((id, index) =>
        this.prisma.identity.menu.update({ where: { id }, data: { sortOrder: index } }),
      );

      await this.prisma.identity.$transaction(updates);

      return { reordered: cmd.orderedIds.length };
    } catch (error) {
      this.logger.error(`ReorderMenusHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
