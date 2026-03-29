import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { UpdateRecurrenceCommand } from './update-recurrence.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(UpdateRecurrenceCommand)
export class UpdateRecurrenceHandler implements ICommandHandler<UpdateRecurrenceCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateRecurrenceCommand) {
    const existing = await this.prisma.working.recurringEvent.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Recurring event not found');

    return this.prisma.working.recurringEvent.update({
      where: { id: cmd.id },
      data: cmd.data as any,
    });
  }
}
