import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateDemoDto } from './dto/create-demo.dto';
import { UpdateDemoDto } from './dto/update-demo.dto';
import { RescheduleDemoDto } from './dto/reschedule-demo.dto';
import { CompleteDemoDto } from './dto/complete-demo.dto';
import { CancelDemoDto } from './dto/cancel-demo.dto';
import { DemoQueryDto } from './dto/demo-query.dto';
export declare class DemoController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateDemoDto, userId: string): Promise<ApiResponse<any>>;
    list(query: DemoQueryDto): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string, fromDate?: string, toDate?: string): Promise<ApiResponse<any>>;
    byLead(leadId: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateDemoDto, userId: string): Promise<ApiResponse<any>>;
    reschedule(id: string, dto: RescheduleDemoDto, userId: string): Promise<ApiResponse<any>>;
    complete(id: string, dto: CompleteDemoDto, userId: string): Promise<ApiResponse<any>>;
    cancel(id: string, dto: CancelDemoDto, userId: string): Promise<ApiResponse<any>>;
}
