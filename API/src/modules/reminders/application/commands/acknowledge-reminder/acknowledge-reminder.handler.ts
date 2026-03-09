import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AcknowledgeReminderCommand } from './acknowledge-reminder.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(AcknowledgeReminderCommand)
export class AcknowledgeReminderHandler implements ICommandHandler<AcknowledgeReminderCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AcknowledgeReminderCommand) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id: cmd.reminderId } });
    if (!reminder) throw new NotFoundException('Reminder not found');

    if (reminder.recipientId !== cmd.userId) {
      throw new NotFoundException('Reminder not found');
    }

    return this.prisma.reminder.update({
      where: { id: cmd.reminderId },
      data: { status: 'ACKNOWLEDGED', acknowledgedAt: new Date() },
    });
  }
}
