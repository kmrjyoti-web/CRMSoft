import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SetupWabaDto, UpdateWabaDto } from './dto/waba.dto';
import { SendTextMessageDto, SendTemplateMessageDto, SendMediaMessageDto, SendInteractiveMessageDto, SendLocationMessageDto } from './dto/message.dto';
import { ConversationQueryDto, AssignConversationDto, LinkConversationDto } from './dto/conversation.dto';
export declare class WhatsAppController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    setupWaba(dto: SetupWabaDto): Promise<ApiResponse<any>>;
    updateWaba(id: string, dto: UpdateWabaDto): Promise<ApiResponse<any>>;
    getWabaDetail(id: string): Promise<ApiResponse<any>>;
    getConversations(dto: ConversationQueryDto): Promise<ApiResponse<unknown[]>>;
    searchConversations(wabaId: string, q: string, pagination: PaginationDto): Promise<ApiResponse<unknown[]>>;
    getEntityConversations(type: string, entityId: string, pagination: PaginationDto): Promise<ApiResponse<unknown[]>>;
    getConversationDetail(id: string): Promise<ApiResponse<any>>;
    getConversationMessages(id: string, pagination: PaginationDto): Promise<ApiResponse<unknown[]>>;
    sendText(id: string, dto: SendTextMessageDto, userId: string): Promise<ApiResponse<any>>;
    sendTemplate(id: string, dto: SendTemplateMessageDto, userId: string): Promise<ApiResponse<any>>;
    sendMedia(id: string, dto: SendMediaMessageDto, userId: string): Promise<ApiResponse<any>>;
    sendInteractive(id: string, dto: SendInteractiveMessageDto, userId: string): Promise<ApiResponse<any>>;
    sendLocation(id: string, dto: SendLocationMessageDto, userId: string): Promise<ApiResponse<any>>;
    markRead(id: string, userId: string): Promise<ApiResponse<null>>;
    assign(id: string, dto: AssignConversationDto, userId: string): Promise<ApiResponse<any>>;
    resolve(id: string, userId: string): Promise<ApiResponse<any>>;
    reopen(id: string): Promise<ApiResponse<any>>;
    linkEntity(id: string, dto: LinkConversationDto, userId: string): Promise<ApiResponse<null>>;
    getAnalytics(wabaId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<any>>;
    getAgentPerformance(wabaId: string, dateFrom?: string, dateTo?: string): Promise<ApiResponse<any>>;
    getOptOuts(wabaId: string, pagination: PaginationDto): Promise<ApiResponse<unknown[]>>;
    optOut(body: {
        wabaId: string;
        phoneNumber: string;
        contactId?: string;
        reason?: string;
    }): Promise<ApiResponse<null>>;
    optIn(body: {
        wabaId: string;
        phoneNumber: string;
    }): Promise<ApiResponse<null>>;
}
