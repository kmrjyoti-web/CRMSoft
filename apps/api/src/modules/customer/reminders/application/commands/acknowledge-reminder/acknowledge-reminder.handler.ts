import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { AcknowledgeReminderCommand } from './acknowledge-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(AcknowledgeReminderCommand)
export class AcknowledgeReminderHandler implements ICommandHandler<AcknowledgeReminderCommand> {
    private readonly logger = new Logger(AcknowledgeReminderHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AcknowledgeReminderCommand) {
    try {
      const reminder = await this.prisma.working.reminder.findUnique({ where: { id: cmd.reminderId } });
      if (!reminder) throw new NotFoundException('Reminder not found');

      if (reminder.recipientId !== cmd.userId) {
        throw new NotFoundException('Reminder not found');
      }

      return this.prisma.working.reminder.update({
        where: { id: cmd.reminderId },
        data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
      });
    } catch (error) {
      this.logger.error(`AcknowledgeReminderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
