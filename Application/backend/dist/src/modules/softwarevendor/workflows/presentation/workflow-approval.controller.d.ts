import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ApproveRejectDto } from './dto/approve-reject.dto';
export declare class WorkflowApprovalController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getPending(userId: string): Promise<ApiResponse<any>>;
    approve(id: string, dto: ApproveRejectDto, userId: string): Promise<ApiResponse<any>>;
    reject(id: string, dto: ApproveRejectDto, userId: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    getHistory(userId: string): Promise<ApiResponse<any>>;
}
