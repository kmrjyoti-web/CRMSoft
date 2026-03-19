// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteTaskCommand } from './complete-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskRecurrenceService } from '../../services/task-recurrence.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(CompleteTaskCommand)
export class CompleteTaskHandler implements ICommandHandler<CompleteTaskCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recurrenceService: TaskRecurrenceService,
  ) {}

  async execute(cmd: CompleteTaskCommand) {
    const task = await this.prisma.task.findUnique({ where: { id: cmd.taskId } });
    if (!task || !task.isActive) throw new NotFoundException('Task not found');

    const data: any = {
      status: 'COMPLETED',
      completedAt: new Date(),
    };
    if (cmd.completionNotes !== undefined) data.completionNotes = cmd.completionNotes;
    if (cmd.actualMinutes !== undefined) data.actualMinutes = cmd.actualMinutes;

    const updated = await this.prisma.task.update({
      where: { id: cmd.taskId },
      data,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Record history
    await this.prisma.taskHistory.create({
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
  }
}
