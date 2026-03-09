import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTaskCommand } from './update-task.command';
import { PrismaService } from '../../../../../core/prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskHandler implements ICommandHandler<UpdateTaskCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(cmd: UpdateTaskCommand) {
    const existing = await this.prisma.task.findUnique({ where: { id: cmd.taskId } });
    if (!existing || !existing.isActive) throw new NotFoundException('Task not found');

    const changes: any = {};
    const history: { field: string; oldValue: string | null; newValue: string | null }[] = [];

    if (cmd.title && cmd.title !== existing.title) {
      changes.title = cmd.title;
      history.push({ field: 'title', oldValue: existing.title, newValue: cmd.title });
    }
    if (cmd.description !== undefined && cmd.description !== existing.description) {
      changes.description = cmd.description;
    }
    if (cmd.priority && cmd.priority !== existing.priority) {
      changes.priority = cmd.priority;
      history.push({ field: 'priority', oldValue: existing.priority, newValue: cmd.priority });
    }
    if (cmd.dueDate) {
      const newDue = new Date(cmd.dueDate);
      changes.dueDate = newDue;
      history.push({ field: 'dueDate', oldValue: existing.dueDate?.toISOString() || null, newValue: newDue.toISOString() });
    }
    if (cmd.recurrence && cmd.recurrence !== existing.recurrence) {
      changes.recurrence = cmd.recurrence;
      history.push({ field: 'recurrence', oldValue: existing.recurrence, newValue: cmd.recurrence });
    }

    if (Object.keys(changes).length === 0) return existing;

    const task = await this.prisma.task.update({
      where: { id: cmd.taskId },
      data: changes,
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Record history
    if (history.length > 0) {
      await this.prisma.taskHistory.createMany({
        data: history.map(h => ({
          taskId: cmd.taskId,
          field: h.field,
          oldValue: h.oldValue,
          newValue: h.newValue,
          changedById: cmd.userId,
        })),
      });
    }

    return task;
  }
}
