import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelReminderCommand } from './cancel-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(CancelReminderCommand)
export class CancelReminderHandler implements ICommandHandler<CancelReminderCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelReminderCommand) {
    const reminder = await this.prisma.working.reminder.findUnique({ where: { id: cmd.id } });
    if (!reminder || !reminder.isActive) throw new NotFoundException('Reminder not found');

    return this.prisma.working.reminder.update({
      where: { id: cmd.id },
      data: { status: 'CANCELLED' },
    });
  }
}
