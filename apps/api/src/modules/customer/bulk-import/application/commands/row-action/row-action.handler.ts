import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowActionCommand } from './row-action.command';

@CommandHandler(RowActionCommand)
export class RowActionHandler implements ICommandHandler<RowActionCommand> {
    private readonly logger = new Logger(RowActionHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RowActionCommand) {
    try {
      return this.prisma.working.importRow.update({
        where: { id: cmd.rowId },
        data: { userAction: cmd.action },
      });
    } catch (error) {
      this.logger.error(`RowActionHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
