// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddWatcherCommand } from './add-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { CrossDbResolverService } from '../../../../../../core/prisma/cross-db-resolver.service';
import { ConflictException, NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(AddWatcherCommand)
export class AddWatcherHandler implements ICommandHandler<AddWatcherCommand> {
    private readonly logger = new Logger(AddWatcherHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resolver: CrossDbResolverService,
  ) {}

  async execute(cmd: AddWatcherCommand) {
    try {
      const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
      if (!task || !task.isActive) throw new NotFoundException('Task not found');

      const existing = await this.prisma.working.taskWatcher.findUnique({
        where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
      });
      if (existing) throw new ConflictException('User is already watching this task');

      const watcher = await this.prisma.working.taskWatcher.create({
        data: { taskId: cmd.taskId, userId: cmd.watcherUserId },
      });
      const user = await this.resolver.resolveUser(watcher.userId);
      return { ...watcher, user };
    } catch (error) {
      this.logger.error(`AddWatcherHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
