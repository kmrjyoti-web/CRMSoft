import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateFollowUpCommand } from './create-follow-up.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { createAutoReminder } from '../../../../../../common/utils/reminder.utils';

@CommandHandler(CreateFollowUpCommand)
export class CreateFollowUpHandler implements ICommandHandler<CreateFollowUpCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateFollowUpCommand) {
    const followUp = await this.prisma.followUp.create({
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
  }
}
