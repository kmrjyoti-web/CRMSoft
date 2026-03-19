import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { ReactivateActivityCommand } from './reactivate-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(ReactivateActivityCommand)
export class ReactivateActivityHandler implements ICommandHandler<ReactivateActivityCommand> {
  private readonly logger = new Logger(ReactivateActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: ReactivateActivityCommand): Promise<void> {
    const activity = await this.prisma.activity.findUnique({ where: { id: command.activityId } });
    if (!activity) throw new NotFoundException(`Activity ${command.activityId} not found`);

    if (activity.isActive) {
      throw new Error('Activity is already active');
    }

    await this.prisma.activity.update({
      where: { id: command.activityId },
      data: { isActive: true, updatedAt: new Date() },
    });

    this.logger.log(`Activity ${command.activityId} reactivated`);
  }
}
