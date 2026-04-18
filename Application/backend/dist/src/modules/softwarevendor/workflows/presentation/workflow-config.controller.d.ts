import { CommandBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { CreateTransitionDto } from './dto/create-transition.dto';
import { UpdateTransitionDto } from './dto/update-transition.dto';
export declare class WorkflowConfigController {
    private readonly commandBus;
    constructor(commandBus: CommandBus);
    addState(workflowId: string, dto: CreateStateDto): Promise<ApiResponse<any>>;
    updateState(stateId: string, dto: UpdateStateDto): Promise<ApiResponse<any>>;
    removeState(stateId: string): Promise<ApiResponse<any>>;
    addTransition(workflowId: string, dto: CreateTransitionDto): Promise<ApiResponse<any>>;
    updateTransition(transitionId: string, dto: UpdateTransitionDto): Promise<ApiResponse<any>>;
    removeTransition(transitionId: string): Promise<ApiResponse<any>>;
}
