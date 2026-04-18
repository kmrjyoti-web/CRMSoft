import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { SubmitApprovalDto, ApproveRejectDto } from './dto/approval-request.dto';
export declare class ApprovalRequestsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    submit(dto: SubmitApprovalDto, user: any): Promise<ApiResponse<any>>;
    approve(id: string, dto: ApproveRejectDto, user: any): Promise<ApiResponse<any>>;
    reject(id: string, dto: ApproveRejectDto, user: any): Promise<ApiResponse<any>>;
    getPending(user: any): Promise<ApiResponse<any>>;
    getMyRequests(userId: string): Promise<ApiResponse<any>>;
    getDetail(id: string): Promise<ApiResponse<any>>;
}
