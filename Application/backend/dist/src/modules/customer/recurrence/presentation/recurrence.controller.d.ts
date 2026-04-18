import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateRecurrenceDto } from './dto/create-recurrence.dto';
import { UpdateRecurrenceDto } from './dto/update-recurrence.dto';
import { RecurrenceQueryDto } from './dto/recurrence-query.dto';
export declare class RecurrenceController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateRecurrenceDto, userId: string): Promise<ApiResponse<any>>;
    list(query: RecurrenceQueryDto): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateRecurrenceDto, userId: string): Promise<ApiResponse<any>>;
    cancel(id: string, userId: string): Promise<ApiResponse<any>>;
}
