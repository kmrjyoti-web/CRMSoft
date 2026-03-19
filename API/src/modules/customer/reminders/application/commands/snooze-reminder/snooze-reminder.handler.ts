import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnoozeReminderCommand } from './snooze-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@CommandHandler(SnoozeReminderCommand)
export class SnoozeReminderHandler implements ICommandHandler<SnoozeReminderCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SnoozeReminderCommand) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id: cmd.id } });
    if (!reminder || !reminder.isActive) throw new NotFoundException('Reminder not found');
    if (reminder.recipientId !== cmd.userId) throw new BadRequestException('Not your reminder');

    if (reminder.snoozeCount >= reminder.maxSnooze) {
      throw new BadRequestException(`Maximum snooze count (${reminder.maxSnooze}) reached`);
    }

    // Default snooze: 30 minutes from now
    const snoozedUntil = cmd.snoozedUntil || new Date(Date.now() + 30 * 60 * 1000);

    return this.prisma.reminder.update({
      where: { id: cmd.id },
      data: {
        status: 'SNOOZED',
        snoozedUntil,
        snoozeCount: { increment: 1 },
      },
    });
  }
}
