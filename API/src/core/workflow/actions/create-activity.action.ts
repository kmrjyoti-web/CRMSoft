import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

@Injectable()
export class CreateActivityAction implements IActionHandler {
  readonly type = 'CREATE_ACTIVITY';
  private readonly logger = new Logger(CreateActivityAction.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { type, subject, description } = config;

    if (!type || !subject) {
      return { status: 'FAILED', errorMessage: 'Missing "type" or "subject" in activity config' };
    }

    try {
      const data: any = {
        type,
        subject,
        description: description || null,
        createdById: context.performer.id,
      };

      if (context.entityType === 'LEAD') data.leadId = context.entityId;
      if (context.entityType === 'CONTACT') data.contactId = context.entityId;

      const activity = await this.prisma.activity.create({ data });
      this.logger.log(`Created activity ${activity.id} for ${context.entityType}/${context.entityId}`);
      return { status: 'SUCCESS', result: { activityId: activity.id } };
    } catch (error: any) {
      return { status: 'FAILED', errorMessage: error.message };
    }
  }
}
