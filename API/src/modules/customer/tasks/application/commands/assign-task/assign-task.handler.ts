// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignTaskCommand } from './assign-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { NotFoundException } from '@nestjs/common';

@CommandHandler(AssignTaskCommand)
export class AssignTaskHandler implements ICommandHandler<AssignTaskCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: TaskAssignmentService,
  ) {}

  async execute(cmd: AssignTaskCommand) {
    const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
    if (!task || !task.isActive) throw new NotFoundException('Task not found');

    // Validate RBAC
    await this.assignmentService.validateAssignment(cmd.userId, cmd.newAssigneeId, cmd.userRoleLevel);

    const updated = await this.prisma.working.task.update({
      where: { id: cmd.taskId },
      data: { assignedToId: cmd.newAssigneeId },
      include: {
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Record history
    await this.prisma.working.taskHistory.create({
      data: {
        taskId: cmd.taskId,
        field: 'assignedToId',
        oldValue: task.assignedToId,
        newValue: cmd.newAssigneeId,
        changedById: cmd.userId,
      },
    });

    return updated;
  }
}
