import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class CreateTaskAction implements IActionHandler {
    private readonly prisma;
    readonly type = "CREATE_TASK";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
    private parseDueDate;
}
