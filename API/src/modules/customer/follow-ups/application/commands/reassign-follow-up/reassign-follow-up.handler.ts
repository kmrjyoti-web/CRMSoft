// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { ReassignFollowUpCommand } from './reassign-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ReassignFollowUpCommand)
export class ReassignFollowUpHandler implements ICommandHandler<ReassignFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ReassignFollowUpCommand) {
    const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
    if (!existing) throw new NotFoundException('Follow-up not found');

    return this.prisma.working.followUp.update({
      where: { id: cmd.id },
      data: { assignedToId: cmd.newAssigneeId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
