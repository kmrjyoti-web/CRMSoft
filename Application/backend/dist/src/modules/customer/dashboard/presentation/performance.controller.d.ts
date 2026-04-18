import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { CreateTargetDto, UpdateTargetDto } from './dto/target.dto';
export declare class PerformanceController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    team(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    leaderboard(q: DashboardQueryDto, userId: string): Promise<ApiResponse<any>>;
    targetTracking(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    createTarget(dto: CreateTargetDto, userId: string): Promise<ApiResponse<any>>;
    listTargets(): Promise<ApiResponse<any>>;
    updateTarget(id: string, dto: UpdateTargetDto): Promise<ApiResponse<any>>;
    deleteTarget(id: string): Promise<ApiResponse<any>>;
}
