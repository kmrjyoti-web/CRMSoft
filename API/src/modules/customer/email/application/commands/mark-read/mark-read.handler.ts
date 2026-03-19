import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { MarkReadCommand } from './mark-read.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(MarkReadCommand)
export class MarkReadHandler implements ICommandHandler<MarkReadCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: MarkReadCommand) {
    const email = await this.prisma.working.email.update({
      where: { id: cmd.emailId },
      data: { isRead: cmd.isRead },
    });

    return email;
  }
}
