import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateTourPlanDto } from './dto/create-tour-plan.dto';
import { UpdateTourPlanDto } from './dto/update-tour-plan.dto';
import { ApproveTourPlanDto, RejectTourPlanDto } from './dto/approve-reject.dto';
import { CheckInDto, CheckOutDto } from './dto/check-in-out.dto';
import { TourPlanQueryDto } from './dto/tour-plan-query.dto';
export declare class TourPlanController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateTourPlanDto, userId: string): Promise<ApiResponse<any>>;
    list(query: TourPlanQueryDto): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string, fromDate?: string, toDate?: string): Promise<ApiResponse<any>>;
    byUser(userId: string, query: TourPlanQueryDto): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateTourPlanDto, userId: string): Promise<ApiResponse<any>>;
    submit(id: string, userId: string): Promise<ApiResponse<any>>;
    approve(id: string, dto: ApproveTourPlanDto, userId: string): Promise<ApiResponse<any>>;
    reject(id: string, dto: RejectTourPlanDto, userId: string): Promise<ApiResponse<any>>;
    cancel(id: string, userId: string): Promise<ApiResponse<any>>;
    checkIn(visitId: string, dto: CheckInDto, userId: string): Promise<ApiResponse<any>>;
    checkOut(visitId: string, dto: CheckOutDto, userId: string): Promise<ApiResponse<any>>;
}
