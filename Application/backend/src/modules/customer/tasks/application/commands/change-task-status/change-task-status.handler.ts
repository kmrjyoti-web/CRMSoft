// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeTaskStatusCommand } from './change-task-status.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskLogicService } from '../../../../../customer/task-logic/task-logic.service';
import { BadRequestException, NotFoundException, Logger } from '@nestjs/common';

const DEFAULT_TRANSITIONS: Record<string, string[]> = {
  OPEN: ['IN_PROGRESS', 'CANCELLED', 'ON_HOLD'],
  IN_PROGRESS: ['COMPLETED', 'ON_HOLD', 'CANCELLED'],
  ON_HOLD: ['OPEN', 'IN_PROGRESS', 'CANCELLED'],
  OVERDUE: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@CommandHandler(ChangeTaskStatusCommand)
export class ChangeTaskStatusHandler implements ICommandHandler<ChangeTaskStatusCommand> {
    private readonly logger = new Logger(ChangeTaskStatusHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly taskLogic: TaskLogicService,
  ) {}

  async execute(cmd: ChangeTaskStatusCommand) {
    try {
      const task = await this.prisma.working.task.findUnique({ where: { id: cmd.taskId } });
      if (!task || !task.isActive) throw new NotFoundException('Task not found');

      // Validate transition
      const transitions = (await this.taskLogic.getConfig<Record<string, string[]>>('STATUS_TRANSITIONS')) || DEFAULT_TRANSITIONS;
      const allowed = transitions[task.status] || [];
      if (!allowed.includes(cmd.newStatus)) {
        throw new BadRequestException(`Cannot transition from ${task.status} to ${cmd.newStatus}. Allowed: ${allowed.join(', ')}`);
      }

      const data: any = { status: cmd.newStatus };
      if (cmd.newStatus === 'COMPLETED') {
        data.completedAt = new Date();
      }

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
          field: 'status',
          oldValue: task.status,
          newValue: cmd.newStatus,
          changedById: cmd.userId,
        },
      });

      return updated;
    } catch (error) {
      this.logger.error(`ChangeTaskStatusHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
