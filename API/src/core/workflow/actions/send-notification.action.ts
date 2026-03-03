import { Injectable, Logger } from '@nestjs/common';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

@Injectable()
export class SendNotificationAction implements IActionHandler {
  readonly type = 'SEND_NOTIFICATION';
  private readonly logger = new Logger(SendNotificationAction.name);

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { userId, message, type: notifType } = config;

    if (!userId || !message) {
      return { status: 'FAILED', errorMessage: 'Missing "userId" or "message" in notification config' };
    }

    // TODO: Integrate with actual notification service when available
    this.logger.log(
      `[NOTIFICATION PLACEHOLDER] User: ${userId}, Type: ${notifType || 'INFO'}, ` +
      `Message: ${message}`,
    );

    return {
      status: 'SUCCESS',
      result: { userId, message, type: notifType || 'INFO', sentAt: new Date().toISOString() },
    };
  }
}
