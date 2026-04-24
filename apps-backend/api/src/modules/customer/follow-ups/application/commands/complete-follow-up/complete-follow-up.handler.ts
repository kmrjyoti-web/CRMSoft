// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { CompleteFollowUpCommand } from './complete-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CompleteFollowUpCommand)
export class CompleteFollowUpHandler implements ICommandHandler<CompleteFollowUpCommand> {
    private readonly logger = new Logger(CompleteFollowUpHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CompleteFollowUpCommand) {
    try {
      const existing = await this.prisma.working.followUp.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Follow-up not found');

      return this.prisma.working.followUp.update({
        where: { id: cmd.id },
        data: { completedAt: new Date(), isOverdue: false },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
        },
      });
    } catch (error) {
      this.logger.error(`CompleteFollowUpHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
