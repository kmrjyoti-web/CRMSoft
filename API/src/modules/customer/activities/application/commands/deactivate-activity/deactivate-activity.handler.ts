import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, Logger } from '@nestjs/common';
import { DeactivateActivityCommand } from './deactivate-activity.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';

@CommandHandler(DeactivateActivityCommand)
export class DeactivateActivityHandler implements ICommandHandler<DeactivateActivityCommand> {
  private readonly logger = new Logger(DeactivateActivityHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(command: DeactivateActivityCommand): Promise<void> {
    const activity = await this.prisma.working.activity.findUnique({ where: { id: command.activityId } });
    if (!activity) throw new NotFoundException(`Activity ${command.activityId} not found`);

    if (!activity.isActive) {
      throw new Error('Activity is already inactive');
    }

    await this.prisma.working.activity.update({
      where: { id: command.activityId },
      data: { isActive: false, updatedAt: new Date() },
    });

    this.logger.log(`Activity ${command.activityId} deactivated`);
  }
}
