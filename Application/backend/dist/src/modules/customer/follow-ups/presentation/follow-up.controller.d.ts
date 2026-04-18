import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateFollowUpDto } from './dto/create-follow-up.dto';
import { UpdateFollowUpDto } from './dto/update-follow-up.dto';
import { SnoozeFollowUpDto } from './dto/snooze-follow-up.dto';
import { ReassignFollowUpDto } from './dto/reassign-follow-up.dto';
import { FollowUpQueryDto } from './dto/follow-up-query.dto';
export declare class FollowUpController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateFollowUpDto, userId: string): Promise<ApiResponse<any>>;
    list(query: FollowUpQueryDto): Promise<ApiResponse<unknown[]>>;
    overdue(assignedToId?: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    stats(userId?: string, fromDate?: string, toDate?: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateFollowUpDto, userId: string): Promise<ApiResponse<any>>;
    complete(id: string, userId: string): Promise<ApiResponse<any>>;
    snooze(id: string, dto: SnoozeFollowUpDto, userId: string): Promise<ApiResponse<any>>;
    reassign(id: string, dto: ReassignFollowUpDto, userId: string): Promise<ApiResponse<any>>;
    remove(id: string, userId: string): Promise<ApiResponse<any>>;
}
