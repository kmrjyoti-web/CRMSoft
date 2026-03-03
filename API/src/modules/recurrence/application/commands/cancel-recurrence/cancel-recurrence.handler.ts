import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CancelRecurrenceCommand } from './cancel-recurrence.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CancelRecurrenceCommand)
export class CancelRecurrenceHandler implements ICommandHandler<CancelRecurrenceCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelRecurrenceCommand) {
    const existing = await this.prisma.recurringEvent.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Recurring event not found');

    return this.prisma.recurringEvent.update({
      where: { id: cmd.id },
      data: { isActive: false },
    });
  }
}
