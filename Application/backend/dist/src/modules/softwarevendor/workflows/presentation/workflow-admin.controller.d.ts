import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateWorkflowDto } from './dto/create-workflow.dto';
import { UpdateWorkflowDto } from './dto/update-workflow.dto';
import { WorkflowQueryDto } from './dto/workflow-query.dto';
export declare class WorkflowAdminController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateWorkflowDto, userId: string): Promise<ApiResponse<any>>;
    findAll(q: WorkflowQueryDto): Promise<ApiResponse<unknown[]>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateWorkflowDto): Promise<ApiResponse<any>>;
    publish(id: string): Promise<ApiResponse<any>>;
    clone(id: string, userId: string): Promise<ApiResponse<any>>;
    getVisual(id: string): Promise<ApiResponse<any>>;
    validate(id: string): Promise<ApiResponse<any>>;
}
