import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateReminderCommand } from './create-reminder.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(CreateReminderCommand)
export class CreateReminderHandler implements ICommandHandler<CreateReminderCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateReminderCommand) {
    return this.prisma.reminder.create({
      data: {
        title: cmd.title,
        message: cmd.message,
        scheduledAt: cmd.scheduledAt,
        channel: (cmd.channel || 'IN_APP') as any,
        entityType: cmd.entityType,
        entityId: cmd.entityId,
        recipientId: cmd.recipientId,
        createdById: cmd.createdById,
      },
      include: {
        recipient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }
}
