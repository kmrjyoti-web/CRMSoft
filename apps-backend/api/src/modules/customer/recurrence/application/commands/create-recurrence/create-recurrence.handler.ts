import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateRecurrenceCommand } from './create-recurrence.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CreateRecurrenceCommand)
export class CreateRecurrenceHandler implements ICommandHandler<CreateRecurrenceCommand> {
    private readonly logger = new Logger(CreateRecurrenceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CreateRecurrenceCommand) {
    try {
      return this.prisma.working.recurringEvent.create({
        data: {
          entityType: cmd.entityType,
          entityId: cmd.entityId,
          pattern: cmd.pattern as any,
          interval: cmd.interval || 1,
          daysOfWeek: cmd.daysOfWeek,
          dayOfMonth: cmd.dayOfMonth,
          startDate: cmd.startDate,
          endDate: cmd.endDate,
          nextOccurrence: cmd.startDate,
          maxOccurrences: cmd.maxOccurrences,
          createdById: cmd.createdById,
          templateData: cmd.templateData,
        },
      });
    } catch (error) {
      this.logger.error(`CreateRecurrenceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
