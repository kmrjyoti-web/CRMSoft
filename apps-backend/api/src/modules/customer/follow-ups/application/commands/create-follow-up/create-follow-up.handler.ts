// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateFollowUpCommand } from './create-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';

@CommandHandler(CreateFollowUpCommand)
export class CreateFollowUpHandler implements ICommandHandler<CreateFollowUpCommand> {
    private readonly logger = new Logger(CreateFollowUpHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateFollowUpCommand) {
    try {
      const followUp = await this.prisma.working.followUp.create({
        data: {
          title: cmd.title,
          description: cmd.description,
          dueDate: cmd.dueDate,
          priority: (cmd.priority || 'MEDIUM') as any,
          entityType: cmd.entityType,
          entityId: cmd.entityId,
          assignedToId: cmd.assignedToId,
          createdById: cmd.createdById,
        },
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      await createAutoReminder(this.prisma, {
        entityType: 'FOLLOW_UP',
        entityId: followUp.id,
        eventDate: cmd.dueDate,
        title: cmd.title,
        recipientId: cmd.assignedToId,
        createdById: cmd.createdById,
        minutesBefore: 60,
      });

      return followUp;
    } catch (error) {
      this.logger.error(`CreateFollowUpHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
