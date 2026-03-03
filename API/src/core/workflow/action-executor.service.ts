import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TemplateResolverService } from './template-resolver.service';
import { IActionHandler, WorkflowActionContext, ActionResult } from './interfaces/action-handler.interface';
import { FieldUpdateAction } from './actions/field-update.action';
import { SendEmailAction } from './actions/send-email.action';
import { SendNotificationAction } from './actions/send-notification.action';
import { CreateActivityAction } from './actions/create-activity.action';
import { CreateTaskAction } from './actions/create-task.action';
import { WebhookAction } from './actions/webhook.action';
import { AssignOwnerAction } from './actions/assign-owner.action';

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);
  private readonly handlers = new Map<string, IActionHandler>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly templateResolver: TemplateResolverService,
    fieldUpdate: FieldUpdateAction,
    sendEmail: SendEmailAction,
    sendNotification: SendNotificationAction,
    createActivity: CreateActivityAction,
    createTask: CreateTaskAction,
    webhook: WebhookAction,
    assignOwner: AssignOwnerAction,
  ) {
    const all = [fieldUpdate, sendEmail, sendNotification, createActivity, createTask, webhook, assignOwner];
    for (const handler of all) {
      this.handlers.set(handler.type, handler);
    }
  }

  async executeAll(
    actions: any[] | null | undefined,
    context: WorkflowActionContext,
    instanceId: string,
    transitionId: string,
  ): Promise<void> {
    if (!actions || actions.length === 0) return;

    for (const action of actions) {
      const result = await this.executeSingle(action, context);
      await this.logAction(instanceId, transitionId, action.type, action.config, result);
    }
  }

  private async executeSingle(action: any, context: WorkflowActionContext): Promise<ActionResult> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      this.logger.warn(`No handler registered for action type: ${action.type}`);
      return { status: 'SKIPPED', errorMessage: `Unknown action type: ${action.type}` };
    }

    try {
      const resolvedConfig = this.templateResolver.resolveObject(action.config || {}, context);
      return await handler.execute(resolvedConfig, context);
    } catch (error: any) {
      this.logger.error(`Action ${action.type} failed: ${error.message}`);
      return { status: 'FAILED', errorMessage: error.message };
    }
  }

  private async logAction(
    instanceId: string,
    transitionId: string,
    actionType: string,
    actionConfig: any,
    result: ActionResult,
  ): Promise<void> {
    try {
      await this.prisma.workflowActionLog.create({
        data: {
          instanceId,
          transitionId,
          actionType,
          actionConfig: actionConfig || {},
          result: result.result || {},
          status: result.status,
          errorMessage: result.errorMessage || null,
          executedAt: new Date(),
        },
      });
    } catch (error: any) {
      this.logger.error(`Failed to log action: ${error.message}`);
    }
  }
}
