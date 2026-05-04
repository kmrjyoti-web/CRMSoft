import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTaskCommand } from './delete-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(DeleteTaskCommand)
export class DeleteTaskHandler implements ICommandHandler<DeleteTaskCommand> {
    private readonly logger = new Logger(DeleteTaskHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: DeleteTaskCommand) {
    try {
      const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
      if (!task || !task.isActive) throw new NotFoundException('Task not found');

      return this.prisma.working.task.update({
        where: { id: cmd.taskId },
        data: { isActive: false },
      });
    } catch (error) {
      this.logger.error(`DeleteTaskHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
