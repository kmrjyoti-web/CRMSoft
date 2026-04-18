import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { ComposeEmailDto, ReplyEmailDto } from './dto/compose-email.dto';
import { EmailQueryDto, SearchEmailsDto } from './dto/email-query.dto';
export declare class EmailController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    compose(dto: ComposeEmailDto, userId: string): Promise<ApiResponse<any>>;
    reply(dto: ReplyEmailDto, userId: string): Promise<ApiResponse<any>>;
    send(id: string, userId: string): Promise<ApiResponse<any>>;
    schedule(id: string, scheduledAt: string, userId: string): Promise<ApiResponse<any>>;
    cancelSchedule(id: string, userId: string): Promise<ApiResponse<any>>;
    star(id: string, starred: boolean): Promise<ApiResponse<any>>;
    markRead(id: string, isRead: boolean): Promise<ApiResponse<any>>;
    linkToEntity(id: string, entityType: string, entityId: string, userId: string): Promise<ApiResponse<any>>;
    unlinkFromEntity(id: string, userId: string): Promise<ApiResponse<any>>;
    list(query: EmailQueryDto): Promise<ApiResponse<unknown[]>>;
    search(query: SearchEmailsDto): Promise<ApiResponse<unknown[]>>;
    analytics(userId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<any>>;
    entityEmails(entityType: string, entityId: string, page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    thread(threadId: string): Promise<ApiResponse<any>>;
    getById(id: string): Promise<ApiResponse<any>>;
}
