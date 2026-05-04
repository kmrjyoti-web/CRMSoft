import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CancelImportCommand } from './cancel-import.command';

@CommandHandler(CancelImportCommand)
export class CancelImportHandler implements ICommandHandler<CancelImportCommand> {
    private readonly logger = new Logger(CancelImportHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelImportCommand) {
    try {
      return this.prisma.working.importJob.update({
        where: { id: cmd.jobId },
        data: { status: 'CANCELLED' },
      });
    } catch (error) {
      this.logger.error(`CancelImportHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
