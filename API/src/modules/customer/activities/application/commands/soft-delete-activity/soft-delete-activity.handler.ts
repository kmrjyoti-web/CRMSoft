import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { SoftDeleteActivityCommand } from './soft-delete-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(SoftDeleteActivityCommand)
export class SoftDeleteActivityHandler implements ICommandHandler<SoftDeleteActivityCommand> {
  private readonly logger = new Logger(SoftDeleteActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: SoftDeleteActivityCommand): Promise<void> {
    const activity = await this.prisma.working.activity.findUnique({ where: { id: command.activityId } });
    if (!activity) throw new NotFoundException(`Activity ${command.activityId} not found`);

    if (activity.isDeleted) {
      throw new Error('Activity is already deleted');
    }

    await this.prisma.working.activity.update({
      where: { id: command.activityId },
      data: {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
        deletedById: command.deletedById,
        updatedAt: new Date(),
      },
    });

    this.logger.log(`Activity ${command.activityId} soft-deleted by ${command.deletedById}`);
  }
}
