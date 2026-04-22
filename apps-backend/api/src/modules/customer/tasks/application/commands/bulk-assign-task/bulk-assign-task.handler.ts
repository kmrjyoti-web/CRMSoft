import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BulkAssignTaskCommand } from './bulk-assign-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { ForbiddenException, Logger } from '@nestjs/common';

@CommandHandler(BulkAssignTaskCommand)
export class BulkAssignTaskHandler implements ICommandHandler<BulkAssignTaskCommand> {
    private readonly logger = new Logger(BulkAssignTaskHandler.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: BulkAssignTaskCommand) {
    try {
      // Only admins (roleLevel <= 1) can bulk-assign
      if (cmd.roleLevel > 1) {
        throw new ForbiddenException('Only admins can bulk-assign tasks');
      }

      // Update all tasks with the new assignee
      const updateResult = await this.prisma.working.task.updateMany({
        where: { id: { in: cmd.taskIds }, tenantId: cmd.tenantId, isActive: true },
        data: { assignedToId: cmd.assignedToId },
      });

      // Create TaskHistory records for each task
      await this.prisma.working.taskHistory.createMany({
        data: cmd.taskIds.map((taskId) => ({
          taskId,
          action: 'REASSIGNED',
          field: 'assignedToId',
          newValue: cmd.assignedToId,
          changedById: cmd.userId,
        })),
      });

      return { updated: updateResult.count };
    } catch (error) {
      this.logger.error(`BulkAssignTaskHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
