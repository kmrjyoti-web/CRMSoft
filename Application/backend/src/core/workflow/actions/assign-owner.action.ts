import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

const ALLOWED_TABLES = ['lead', 'contact', 'demo', 'tourPlan', 'quotation', 'activity', 'organization'];

@Injectable()
export class AssignOwnerAction implements IActionHandler {
  readonly type = 'ASSIGN_OWNER';
  private readonly logger = new Logger(AssignOwnerAction.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { entityTable, ownerField, userId } = config;
    const table = entityTable || this.entityTypeToTable(context.entityType);
    const field = ownerField || 'allocatedToId';
    const targetUserId = userId || context.performer.id;

    if (!ALLOWED_TABLES.includes(table)) {
      return { status: 'FAILED', errorMessage: `Table "${table}" is not in allowed list` };
    }

    try {
      await (this.prisma as any)[table].update({
        where: { id: context.entityId },
        data: { [field]: targetUserId },
      });
      this.logger.log(`Assigned ${field}=${targetUserId} on ${table}/${context.entityId}`);
      return { status: 'SUCCESS', result: { table, field, userId: targetUserId } };
    } catch (error: any) {
      return { status: 'FAILED', errorMessage: error.message };
    }
  }

  private entityTypeToTable(entityType: string): string {
    const map: Record<string, string> = {
      LEAD: 'lead', CONTACT: 'contact', DEMO: 'demo',
      TOUR_PLAN: 'tourPlan', QUOTATION: 'quotation', ORGANIZATION: 'organization',
    };
    return map[entityType] || entityType.toLowerCase();
  }
}
