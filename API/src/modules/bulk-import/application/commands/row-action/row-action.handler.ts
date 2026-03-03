import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { RowActionCommand } from './row-action.command';

@CommandHandler(RowActionCommand)
export class RowActionHandler implements ICommandHandler<RowActionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RowActionCommand) {
    return this.prisma.importRow.update({
      where: { id: cmd.rowId },
      data: { userAction: cmd.action },
    });
  }
}
