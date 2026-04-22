import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveWatcherCommand } from './remove-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(RemoveWatcherCommand)
export class RemoveWatcherHandler implements ICommandHandler<RemoveWatcherCommand> {
    private readonly logger = new Logger(RemoveWatcherHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemoveWatcherCommand) {
    try {
      const existing = await this.prisma.working.taskWatcher.findUnique({
        where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
      });
      if (!existing) throw new NotFoundException('Watcher not found');

      return this.prisma.working.taskWatcher.delete({
        where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
      });
    } catch (error) {
      this.logger.error(`RemoveWatcherHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
