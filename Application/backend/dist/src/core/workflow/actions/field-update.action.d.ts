import { PrismaService } from '../../prisma/prisma.service';
import { IActionHandler, ActionResult, WorkflowActionContext } from '../interfaces/action-handler.interface';
export declare class FieldUpdateAction implements IActionHandler {
    private readonly prisma;
    readonly type = "FIELD_UPDATE";
    private readonly logger;
    constructor(prisma: PrismaService);
    execute(config: any, context: WorkflowActionContext): Promise<ActionResult>;
}
