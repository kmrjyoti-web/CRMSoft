import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeleteActivityCommand } from './delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeleteActivityCommand)
export class DeleteActivityHandler implements ICommandHandler<DeleteActivityCommand> {
    private readonly logger = new Logger(DeleteActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteActivityCommand) {
    try {
      const existing = await this.prisma.working.activity.findUnique({ where: { id: cmd.id } });
      if (!existing) throw new NotFoundException('Activity not found');

      await this.prisma.working.activity.delete({ where: { id: cmd.id } });

      await this.prisma.working.calendarEvent.updateMany({
        where: { eventType: 'ACTIVITY', sourceId: cmd.id },
        data: { isActive: false },
      });

      return { id: cmd.id, deleted: true };
    } catch (error) {
      this.logger.error(`DeleteActivityHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
