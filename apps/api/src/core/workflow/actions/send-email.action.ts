import { Injectable, Logger } from '@nestjs/common';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

@Injectable()
export class SendEmailAction implements IActionHandler {
  readonly type = 'SEND_EMAIL';
  private readonly logger = new Logger(SendEmailAction.name);

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { to, subject, body, template } = config;

    if (!to || !subject) {
      return { status: 'FAILED', errorMessage: 'Missing "to" or "subject" in email config' };
    }

    // NOTE: Workflow email action pending integration
    this.logger.log(
      `[EMAIL PLACEHOLDER] To: ${to}, Subject: ${subject}, ` +
      `Entity: ${context.entityType}/${context.entityId}`,
    );

    return {
      status: 'SUCCESS',
      result: { to, subject, template: template || 'default', sentAt: new Date().toISOString() },
    };
  }
}
