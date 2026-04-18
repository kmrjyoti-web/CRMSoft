import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { InitializeWorkflowDto } from './dto/initialize-workflow.dto';
import { ExecuteTransitionDto } from './dto/execute-transition.dto';
export declare class WorkflowExecutionController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    initialize(dto: InitializeWorkflowDto, userId: string): Promise<ApiResponse<any>>;
    transition(dto: ExecuteTransitionDto, userId: string): Promise<ApiResponse<any>>;
    getInstance(instanceId: string): Promise<ApiResponse<any>>;
    getEntityStatus(entityType: string, entityId: string): Promise<ApiResponse<any>>;
    getTransitions(instanceId: string, userId: string): Promise<ApiResponse<any>>;
    getHistory(instanceId: string): Promise<ApiResponse<any>>;
    rollback(instanceId: string, userId: string, comment?: string): Promise<ApiResponse<any>>;
    getStats(entityType?: string): Promise<ApiResponse<any>>;
}
