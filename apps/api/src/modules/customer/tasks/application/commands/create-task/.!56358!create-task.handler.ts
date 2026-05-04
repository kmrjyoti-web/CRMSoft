// @ts-nocheck
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { CreateTaskCommand } from './create-task.command';
import { PrismaService } from '../../../../../../core/prisma/prisma.service';
import { TaskAssignmentService } from '../../services/task-assignment.service';
import { TaskRecurrenceService } from '../../services/task-recurrence.service';
import { TaskRecurrence } from '@prisma/working-client';
import { CALENDAR_COLORS } from '../../../../../../common/utils/calendar-colors';
import { getErrorMessage } from '@/common/utils/error.utils';

@CommandHandler(CreateTaskCommand)
export class CreateTaskHandler implements ICommandHandler<CreateTaskCommand> {
  private readonly logger = new Logger(CreateTaskHandler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly assignmentService: TaskAssignmentService,
    private readonly recurrenceService: TaskRecurrenceService,
  ) {}

  async execute(cmd: CreateTaskCommand) {
    // RBAC assignment validation (when assigning to specific user)
    const scope = cmd.assignmentScope || 'SPECIFIC_USER';
    if (cmd.assignedToId && cmd.assignedToId !== cmd.createdById) {
      await this.assignmentService.validateAssignment(
        cmd.createdById, cmd.assignedToId, cmd.creatorRoleLevel,
        scope, cmd.assignedDepartmentId, cmd.assignedDesignationId, cmd.assignedRoleId,
      );
    }

    // Generate task number
    const count = await this.prisma.working.task.count({ where: { tenantId: cmd.tenantId } });
    const taskNumber = `TSK-${String(count + 1).padStart(4, '0')}`;

    const recurrence = (cmd.recurrence as TaskRecurrence) || 'NONE';
    const dueDate = cmd.dueDate ? new Date(cmd.dueDate) : null;
    const nextRecurrenceDate = dueDate && recurrence !== 'NONE'
      ? this.recurrenceService.calculateNextDate(dueDate, recurrence)
      : null;

    // Resolve lead linking
    const entityType = cmd.leadId ? 'LEAD' : cmd.entityType;
    const entityId = cmd.leadId || cmd.entityId;

