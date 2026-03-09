import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTaskCommand } from './delete-task.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteTaskCommand) {
    const task = await this.prisma.task.findUnique({ where: { id: cmd.taskId } });
    if (!task || !task.isActive) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: cmd.taskId },
      data: { isActive: false },
    });
  }
}
