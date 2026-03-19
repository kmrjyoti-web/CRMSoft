import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CancelImportCommand } from './cancel-import.command';

@CommandHandler(CancelImportCommand)
export class CancelImportHandler implements ICommandHandler<CancelImportCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelImportCommand) {
    return this.prisma.importJob.update({
      where: { id: cmd.jobId },
      data: { status: 'CANCELLED' },
    });
  }
}
