import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { UpdateCapacityDto, SetAvailabilityDto } from './dto/update-capacity.dto';
import { WorkloadService } from '../services/workload.service';
export declare class OwnershipWorkloadController {
    private readonly commandBus;
    private readonly queryBus;
    private readonly workload;
    constructor(commandBus: CommandBus, queryBus: QueryBus, workload: WorkloadService);
    getDashboard(query: any): Promise<ApiResponse<any>>;
    getUserWorkload(userId: string): Promise<ApiResponse<any>>;
    updateCapacity(userId: string, dto: UpdateCapacityDto): Promise<ApiResponse<any>>;
    setAvailability(dto: SetAvailabilityDto, currentUserId: string): Promise<ApiResponse<any>>;
    getRebalanceSuggestions(): Promise<ApiResponse<any[]>>;
}
