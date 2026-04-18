import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class AssignOwnerAction implements IActionHandler {
    private readonly prisma;
    readonly type = "ASSIGN_OWNER";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
    private entityTypeToTable;
}
