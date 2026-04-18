import { QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
export declare class DashboardController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    executive(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    pipeline(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    funnel(q: DashboardQueryDto): Promise<ApiResponse<any>>;
    myDashboard(userId: string): Promise<ApiResponse<any>>;
}
