import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AddWatcherCommand } from './add-watcher.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

@CommandHandler(AddWatcherCommand)
export class AddWatcherHandler implements ICommandHandler<AddWatcherCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: AddWatcherCommand) {
    const task = await this.prisma.task.findUnique({ where: { id: cmd.taskId } });
    if (!task || !task.isActive) throw new NotFoundException('Task not found');

    const existing = await this.prisma.taskWatcher.findUnique({
      where: { taskId_userId: { taskId: cmd.taskId, userId: cmd.watcherUserId } },
    });
    if (existing) throw new ConflictException('User is already watching this task');

    return this.prisma.taskWatcher.create({
      data: { taskId: cmd.taskId, userId: cmd.watcherUserId },
      include: { user: { select: { id: true, firstName: true, lastName: true } } },
    });
  }
}
