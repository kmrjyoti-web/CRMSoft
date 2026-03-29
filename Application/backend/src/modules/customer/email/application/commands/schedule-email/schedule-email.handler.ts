import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { ScheduleEmailCommand } from './schedule-email.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ScheduleEmailCommand)
export class ScheduleEmailHandler implements ICommandHandler<ScheduleEmailCommand> {
  private readonly logger = new Logger(ScheduleEmailHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ScheduleEmailCommand) {
    const email = await this.prisma.working.email.update({
      where: { id: cmd.emailId },
      data: {
        status: 'QUEUED',
        scheduledAt: cmd.scheduledAt,
      },
    });

    this.logger.log(`Email scheduled: ${cmd.emailId} for ${cmd.scheduledAt.toISOString()}`);
    return email;
  }
}
