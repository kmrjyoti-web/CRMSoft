import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { PlanQueryDto } from './dto/plan-query.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class PlanAdminController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreatePlanDto): Promise<ApiResponse<any>>;
    findAll(query: PlanQueryDto): Promise<ApiResponse<any>>;
    findById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdatePlanDto): Promise<ApiResponse<any>>;
    deactivate(id: string): Promise<ApiResponse<any>>;
}
