import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderQueryDto } from './dto/reminder-query.dto';
export declare class ReminderController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateReminderDto, userId: string): Promise<ApiResponse<any>>;
    list(query: ReminderQueryDto): Promise<ApiResponse<unknown[]>>;
    pending(recipientId?: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string): Promise<ApiResponse<any>>;
    managerStats(user: any): Promise<ApiResponse<any>>;
    dismiss(id: string, userId: string): Promise<ApiResponse<any>>;
    snooze(id: string, userId: string, snoozedUntil?: string): Promise<ApiResponse<any>>;
    cancel(id: string, userId: string): Promise<ApiResponse<any>>;
    acknowledge(id: string, userId: string): Promise<ApiResponse<any>>;
}
