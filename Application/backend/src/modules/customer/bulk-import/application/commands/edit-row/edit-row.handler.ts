import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { EditRowCommand } from './edit-row.command';

@CommandHandler(EditRowCommand)
export class EditRowHandler implements ICommandHandler<EditRowCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: EditRowCommand) {
    return this.prisma.working.importRow.update({
      where: { id: cmd.rowId },
      data: { userEditedData: cmd.editedData },
    });
  }
}
