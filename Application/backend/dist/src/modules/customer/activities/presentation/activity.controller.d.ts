import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { CompleteActivityDto } from './dto/complete-activity.dto';
import { ActivityQueryDto } from './dto/activity-query.dto';
export declare class ActivityController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateActivityDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    list(query: ActivityQueryDto): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string, fromDate?: string, toDate?: string): Promise<ApiResponse<any>>;
    byEntity(type: string, entityId: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateActivityDto, userId: string): Promise<ApiResponse<any>>;
    complete(id: string, dto: CompleteActivityDto, userId: string): Promise<ApiResponse<any>>;
    remove(id: string, userId: string): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
    reactivate(id: string): Promise<ApiResponse<any>>;
    softDelete(id: string, userId: string): Promise<ApiResponse<any>>;
    restore(id: string): Promise<ApiResponse<any>>;
    permanentDelete(id: string): Promise<ApiResponse<{
        id: string;
        deleted: boolean;
    }>>;
}
