// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteTaskCommand } from './complete-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskRecurrenceService } from '../../services/task-recurrence.service';
import { NotFoundException, Logger } from '@nestjs/common';

@CommandHandler(CompleteTaskCommand)
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand> {
    private readonly logger = new Logger(CompleteTaskHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recurrenceService: TaskRecurrenceService,
  ) {}

  async execute(cmd: CompleteTaskCommand) {
    try {
      const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
      if (!task || !task.isActive) throw new NotFoundException('Task not found');

      const data: any = {
        status: 'COMPLETED',
        completedAt: new Date(),
      };
      if (cmd.completionNotes !== undefined) data.completionNotes = cmd.completionNotes;
      if (cmd.actualMinutes !== undefined) data.actualMinutes = cmd.actualMinutes;

      const updated = await this.prisma.working.task.update({
        where: { id: cmd.taskId },
        data,
        include: {
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          createdBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Record history
      await this.prisma.working.taskHistory.create({
        data: {
          taskId: cmd.taskId,
          action: 'STATUS_CHANGED',
          field: 'status',
          oldValue: task.status,
          newValue: 'COMPLETED',
          changedById: cmd.userId,
        },
      });

      // Process recurring tasks if recurrence is set
      if (task.recurrence && task.recurrence !== 'NONE') {
        await this.recurrenceService.processRecurringTasks();
      }

      return updated;
    } catch (error) {
      this.logger.error(`CompleteTaskHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
