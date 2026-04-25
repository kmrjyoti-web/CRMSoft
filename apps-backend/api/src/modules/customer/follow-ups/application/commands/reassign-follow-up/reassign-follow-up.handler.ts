// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { ReassignFollowUpCommand } from './reassign-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ReassignFollowUpCommand)
export class ReassignFollowUpHandler implements ICommandHandler<ReassignFollowUpCommand> {
    private readonly logger = new Logger(ReassignFollowUpHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: ReassignFollowUpCommand) {
    try {
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
    } catch (error) {
      this.logger.error(`ReassignFollowUpHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
