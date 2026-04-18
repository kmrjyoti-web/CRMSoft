import { ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { ApproveTransitionCommand } from './approve-transition.command';
export declare class ApproveTransitionHandler implements ICommandHandler<ApproveTransitionCommand> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(cmd: ApproveTransitionCommand): Promise<{
        instanceId: any;
        fromState: any;
        toState: any;
        action: string;
        historyId: string;
    }>;
}
