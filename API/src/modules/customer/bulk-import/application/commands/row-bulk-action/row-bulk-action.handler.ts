import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { RowBulkActionCommand } from './row-bulk-action.command';

@CommandHandler(RowBulkActionCommand)
export class RowBulkActionHandler implements ICommandHandler<RowBulkActionCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RowBulkActionCommand) {
    let where: any = { importJobId: cmd.jobId };

    switch (cmd.action) {
      case 'ACCEPT_ALL_VALID':
        where.rowStatus = 'VALID';
        break;
      case 'SKIP_ALL_DUPLICATES':
        where.rowStatus = { in: ['DUPLICATE_EXACT', 'DUPLICATE_FUZZY', 'DUPLICATE_IN_FILE'] };
        break;
      case 'SKIP_ALL_INVALID':
        where.rowStatus = 'INVALID';
        break;
      case 'ACCEPT_ALL':
        where.rowStatus = { in: ['VALID', 'DUPLICATE_EXACT', 'DUPLICATE_FUZZY'] };
        break;
    }

    const action = cmd.action.startsWith('SKIP') ? 'SKIP' : 'ACCEPT';
    const result = await this.prisma.importRow.updateMany({
      where,
      data: { userAction: action },
    });

    return { updated: result.count, action };
  }
}
