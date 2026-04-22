import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SnoozeReminderCommand } from './snooze-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(SnoozeReminderCommand)
export class SnoozeReminderHandler implements ICommandHandler<SnoozeReminderCommand> {
    private readonly logger = new Logger(SnoozeReminderHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SnoozeReminderCommand) {
    try {
      const reminder = await this.prisma.working.reminder.findUnique({ where: { id: cmd.id } });
      if (!reminder || !reminder.isActive) throw new NotFoundException('Reminder not found');
      if (reminder.recipientId !== cmd.userId) throw new BadRequestException('Not your reminder');

      if (reminder.snoozeCount >= reminder.maxSnooze) {
        throw new BadRequestException(`Maximum snooze count (${reminder.maxSnooze}) reached`);
      }

      // Default snooze: 30 minutes from now
      const snoozedUntil = cmd.snoozedUntil || new Date(Date.now() + 30 * 60 * 1000);

      return this.prisma.working.reminder.update({
        where: { id: cmd.id },
        data: {
          status: 'SNOOZED',
          snoozedUntil,
          snoozeCount: { increment: 1 },
        },
      });
    } catch (error) {
      this.logger.error(`SnoozeReminderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
