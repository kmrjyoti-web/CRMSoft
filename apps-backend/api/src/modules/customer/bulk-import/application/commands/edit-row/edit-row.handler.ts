import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { EditRowCommand } from './edit-row.command';

@CommandHandler(EditRowCommand)
export class EditRowHandler implements ICommandHandler<EditRowCommand> {
    private readonly logger = new Logger(EditRowHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: EditRowCommand) {
    try {
      return this.prisma.working.importRow.update({
        where: { id: cmd.rowId },
        data: { userEditedData: cmd.editedData },
      });
    } catch (error) {
      this.logger.error(`EditRowHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
