import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class WebhookAction implements IActionHandler {
    readonly type = "WEBHOOK";
    private readonly logger;
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
}
