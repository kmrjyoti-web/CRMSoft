import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveWatcherCommand } from './remove-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(RemoveWatcherCommand)
export class RemoveWatcherHandler implements ICommandHandler<RemoveWatcherCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: RemoveWatcherCommand) {
    const existing = await this.prisma.taskWatcher.findUnique({
      where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
    });
    if (!existing) throw new NotFoundException('Watcher not found');

    return this.prisma.taskWatcher.delete({
      where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
    });
  }
}
