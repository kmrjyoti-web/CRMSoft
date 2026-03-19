import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PermanentDeleteActivityCommand } from './permanent-delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(PermanentDeleteActivityCommand)
export class PermanentDeleteActivityHandler implements ICommandHandler<PermanentDeleteActivityCommand> {
  private readonly logger = new Logger(PermanentDeleteActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: PermanentDeleteActivityCommand): Promise<void> {
    const activity = await this.prisma.activity.findUnique({ where: { id: command.activityId } });
    if (!activity) throw new NotFoundException(`Activity ${command.activityId} not found`);

    if (!activity.isDeleted) {
      throw new BadRequestException(
        'Activity must be soft-deleted before permanent deletion',
      );
    }

    await this.prisma.activity.delete({ where: { id: command.activityId } });

    await this.prisma.calendarEvent.updateMany({
      where: { eventType: 'ACTIVITY', sourceId: command.activityId },
      data: { isActive: false },
    });

    this.logger.log(`Activity ${command.activityId} permanently deleted`);
  }
}
