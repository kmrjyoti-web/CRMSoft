import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReorderMenusCommand } from './reorder-menus.command';
import { PrismaService } from '../../../../../../../core/prisma/prisma.service';

@CommandHandler(ReorderMenusCommand)
export class ReorderMenusHandler implements ICommandHandler<ReorderMenusCommand> {
  constructor(private readonly prisma: PrismaService) {}

  /** Reorder menu items by updating sortOrder in a transaction. */
  async execute(cmd: ReorderMenusCommand) {
    const updates = cmd.orderedIds.map((id, index) =>
      this.prisma.identity.menu.update({ where: { id }, data: { sortOrder: index } }),
    );

    await this.prisma.identity.$transaction(updates);

    return { reordered: cmd.orderedIds.length };
  }
}
