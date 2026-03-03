import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { RestoreActivityCommand } from './restore-activity.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';

@CommandHandler(RestoreActivityCommand)
export class RestoreActivityHandler implements ICommandHandler<RestoreActivityCommand> {
  private readonly logger = new Logger(RestoreActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: RestoreActivityCommand): Promise<void> {
    const activity = await this.prisma.activity.findUnique({ where: { id: command.activityId } });
    if (!activity) throw new NotFoundException(`Activity ${command.activityId} not found`);

    if (!activity.isDeleted) {
      throw new Error('Activity is not deleted');
    }

    await this.prisma.activity.update({
      where: { id: command.activityId },
      data: {
        isDeleted: false,
        isActive: true,
        deletedAt: null,
        deletedById: null,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Activity ${command.activityId} restored`);
  }
}
