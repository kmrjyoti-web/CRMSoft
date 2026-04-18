import { ICommandHandler } from '@nestjs/cqrs';
import { WorkflowEngineService } from '../../../../../../core/workflow/workflow-engine.service';
import { ExecuteTransitionCommand } from './execute-transition.command';
export declare class ExecuteTransitionHandler implements ICommandHandler<ExecuteTransitionCommand> {
    private readonly engine;
    private readonly logger;
    constructor(engine: WorkflowEngineService);
    execute(cmd: ExecuteTransitionCommand): Promise<import("../../../../../../core/workflow/interfaces/workflow-types.interface").TransitionResult>;
}
