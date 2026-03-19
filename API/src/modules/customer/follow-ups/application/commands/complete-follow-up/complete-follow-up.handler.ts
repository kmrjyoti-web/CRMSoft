// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CompleteFollowUpCommand } from './complete-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteFollowUpCommand)
export class CompleteFollowUpHandler implements ICommandHandler<CompleteFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CompleteFollowUpCommand) {
    const existing = await this.prisma.followUp.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    return this.prisma.followUp.update({
      where: { id: cmd.id },
      data: { completedAt: new Date(), isOverdue: false },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
