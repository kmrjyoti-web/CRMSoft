import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { CancelRecurrenceCommand } from './cancel-recurrence.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(CancelRecurrenceCommand)
export class CancelRecurrenceHandler implements ICommandHandler<CancelRecurrenceCommand> {
    private readonly logger = new Logger(CancelRecurrenceHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: CancelRecurrenceCommand) {
    try {
      const existing = await this.prisma.working.recurringEvent.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Recurring event not found');

      return this.prisma.working.recurringEvent.update({
        where: { id: cmd.id },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error(`CancelRecurrenceHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
