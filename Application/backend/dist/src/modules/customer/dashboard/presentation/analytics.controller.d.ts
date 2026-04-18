import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
export declare class AnalyticsController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    heatmap(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    revenue(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    leadSources(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    lostReasons(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    aging(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    velocity(q: DashboardQueryDto): Promise<ApiResponse<any>>;
}
