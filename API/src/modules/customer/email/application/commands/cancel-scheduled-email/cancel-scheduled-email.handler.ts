import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CancelScheduledEmailCommand } from './cancel-scheduled-email.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelScheduledEmailCommand)
export class CancelScheduledEmailHandler implements ICommandHandler<CancelScheduledEmailCommand> {
  private readonly logger = new Logger(CancelScheduledEmailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelScheduledEmailCommand) {
    const email = await this.prisma.working.email.update({
      where: { id: cmd.emailId },
      data: {
        status: 'DRAFT',
        scheduledAt: null,
      },
    });

    this.logger.log(`Scheduled email cancelled: ${cmd.emailId} by user ${cmd.userId}`);
    return email;
  }
}
