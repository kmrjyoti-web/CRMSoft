import { Injectable, Logger } from '@nestjs/common';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';

@Injectable()
export class WebhookAction implements IActionHandler {
  readonly type = 'WEBHOOK';
  private readonly logger = new Logger(WebhookAction.name);

  async execute(config: any, context: WorkflowActionContext): Promise<ActionResult> {
    const { url, method, headers, body } = config;

    if (!url) {
      return { status: 'FAILED', errorMessage: 'Missing "url" in webhook config' };
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        method: method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(headers || {}),
        },
        body: body ? JSON.stringify(body) : JSON.stringify({
          event: 'workflow_transition',
          entityType: context.entityType,
          entityId: context.entityId,
          state: context.currentState.code,
          performedBy: context.performer.id,
          timestamp: context.timestamp.toISOString(),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const text = await response.text().catch(() => 'No body');
        this.logger.warn(`Webhook ${url} returned ${response.status}: ${text}`);
        return { status: 'FAILED', errorMessage: `HTTP ${response.status}: ${text}` };
      }

      const responseData = await response.json().catch(() => ({}));
      this.logger.log(`Webhook ${url} succeeded with ${response.status}`);
      return { status: 'SUCCESS', result: { statusCode: response.status, data: responseData } };
    } catch (error: any) {
      const msg = error.name === 'AbortError' ? 'Webhook timed out after 10s' : error.message;
      return { status: 'FAILED', errorMessage: msg };
    }
  }
}
