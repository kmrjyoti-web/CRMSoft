// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateReminderCommand } from './create-reminder.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateReminderCommand)
export class CreateReminderHandler implements ICommandHandler<CreateReminderCommand> {
    private readonly logger = new Logger(CreateReminderHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateReminderCommand) {
    try {
      return this.prisma.working.reminder.create({
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
    } catch (error) {
      this.logger.error(`CreateReminderHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
