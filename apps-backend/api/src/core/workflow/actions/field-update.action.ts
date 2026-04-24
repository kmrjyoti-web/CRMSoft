import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

const ALLOWED_TABLES = ['lead', 'contact', 'demo', 'tourPlan', 'quotation', 'activity', 'organization'];

@Injectable()
export class FieldUpdateAction implements IActionHandler {
  readonly type = 'FIELD_UPDATE';
  private readonly logger = new Logger(FieldUpdateAction.name);

  constructor(private readonly prisma: PrismaService) {}

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { entityTable, field, value } = config;

    if (!entityTable || !field) {
      return { status: 'FAILED', errorMessage: 'Missing entityTable or field in config' };
    }

    if (!ALLOWED_TABLES.includes(entityTable)) {
      return { status: 'FAILED', errorMessage: `Table "${entityTable}" is not in allowed list` };
    }

    try {
      const result = await (this.prisma as any)[entityTable].update({
        where: { id: context.entityId },
        data: { [field]: value },
      });
      this.logger.log(`Updated ${entityTable}.${field} for entity ${context.entityId}`);
      return { status: 'SUCCESS', result: { updatedField: field, newValue: value } };
    } catch (error: any) { return { status: 'FAILED', errorMessage: error instanceof Error ? error.message : String(error) };
    }
  }
}
