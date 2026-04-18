import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class SendEmailAction implements IActionHandler {
    readonly type = "SEND_EMAIL";
    private readonly logger;
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
}
