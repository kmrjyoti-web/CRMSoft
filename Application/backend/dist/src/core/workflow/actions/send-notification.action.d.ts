import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class SendNotificationAction implements IActionHandler {
    readonly type = "SEND_NOTIFICATION";
    private readonly logger;
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
}
