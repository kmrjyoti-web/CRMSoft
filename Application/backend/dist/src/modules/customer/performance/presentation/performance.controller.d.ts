import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTargetDto } from './dto/create-target.dto';
import { UpdateTargetDto } from './dto/update-target.dto';
import { TargetQueryDto } from './dto/target-query.dto';
export declare class PerformanceController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    listTargets(query: TargetQueryDto): Promise<ApiResponse<unknown[]>>;
    getTarget(id: string): Promise<ApiResponse<any>>;
    createTarget(dto: CreateTargetDto, userId: string): Promise<ApiResponse<any>>;
    updateTarget(id: string, dto: UpdateTargetDto, userId: string): Promise<ApiResponse<any>>;
    deleteTarget(id: string, userId: string): Promise<ApiResponse<any>>;
    getLeaderboard(period?: string, limit?: number): Promise<ApiResponse<any>>;
    getTeamPerformance(period?: string): Promise<ApiResponse<any>>;
    trackingByUser(userId: string, query: TargetQueryDto): Promise<ApiResponse<unknown[]>>;
}
