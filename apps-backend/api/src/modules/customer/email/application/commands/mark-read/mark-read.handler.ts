import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { MarkReadCommand } from './mark-read.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand> {
    private readonly logger = new Logger(MarkReadHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: MarkReadCommand) {
    try {
      const email = await this.prisma.working.email.update({
        where: { id: cmd.emailId },
        data: { isRead: cmd.isRead },
      });

      return email;
    } catch (error) {
      this.logger.error(`MarkReadHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
