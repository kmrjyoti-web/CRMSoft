import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

@Injectable()
export class CreateTaskAction implements IActionHandler {
  readonly type = 'CREATE_TASK';
  private readonly logger = new Logger(CreateTaskAction.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { subject, description, dueDate, assignedToId } = config;

    if (!subject) {
      return { status: 'FAILED', errorMessage: 'Missing "subject" in task config' };
    }

    try {
      const scheduledAt = this.parseDueDate(dueDate);
      const data: any = {
        type: 'NOTE',
        subject,
        description: description || null,
        scheduledAt,
        createdById: assignedToId || context.performer.id,
      };

      if (context.entityType === 'LEAD') data.leadId = context.entityId;
      if (context.entityType === 'CONTACT') data.contactId = context.entityId;

      const activity = await this.prisma.working.activity.create({ data });
      this.logger.log(`Created task ${activity.id} due ${scheduledAt.toISOString()}`);
      return { status: 'SUCCESS', result: { taskId: activity.id, dueAt: scheduledAt } };
    } catch (error: any) {
      return { status: 'FAILED', errorMessage: error.message };
    }
  }

  private parseDueDate(dueDate?: string): Date {
    if (!dueDate) return new Date(Date.now() + 24 * 60 * 60 * 1000);
    const match = dueDate.match(/^\+(\d+)([dhm])$/);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2];
      const ms = unit === 'd' ? amount * 86400000 : unit === 'h' ? amount * 3600000 : amount * 60000;
      return new Date(Date.now() + ms);
    }
    return new Date(dueDate);
  }
}
