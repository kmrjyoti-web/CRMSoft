import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TrackEventDto } from './dto/track-event.dto';
export declare class AnalyticsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    track(dto: TrackEventDto, userId: string, tenantId: string): Promise<ApiResponse<null>>;
    getAnalytics(entityType: string, entityId: string, tenantId: string): Promise<ApiResponse<any>>;
}
