import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { SnoozeFollowUpCommand } from './snooze-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SnoozeFollowUpCommand)
export class SnoozeFollowUpHandler implements ICommandHandler<SnoozeFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SnoozeFollowUpCommand) {
    const existing = await this.prisma.followUp.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    return this.prisma.followUp.update({
      where: { id: cmd.id },
      data: { snoozedUntil: cmd.snoozedUntil, isOverdue: false },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
