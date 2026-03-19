import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { DismissReminderCommand } from './dismiss-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DismissReminderCommand)
export class DismissReminderHandler implements ICommandHandler<DismissReminderCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DismissReminderCommand) {
    const existing = await this.prisma.working.reminder.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Reminder not found');

    return this.prisma.working.reminder.update({
      where: { id: cmd.id },
      data: { isSent: true, sentAt: new Date() },
    });
  }
}
