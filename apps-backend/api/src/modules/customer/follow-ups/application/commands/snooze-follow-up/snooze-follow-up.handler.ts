// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { SnoozeFollowUpCommand } from './snooze-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SnoozeFollowUpCommand)
export class SnoozeFollowUpHandler implements ICommandHandler<SnoozeFollowUpCommand> {
    private readonly logger = new Logger(SnoozeFollowUpHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: SnoozeFollowUpCommand) {
    try {
      const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Follow-up not found');

      return this.prisma.working.followUp.update({
        where: { id: cmd.id },
        data: { snoozedUntil: cmd.snoozedUntil, isOverdue: false },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      this.logger.error(`SnoozeFollowUpHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
