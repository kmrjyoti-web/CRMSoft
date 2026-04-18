import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateChatbotFlowDto, UpdateChatbotFlowDto, ToggleChatbotFlowDto } from './dto/chatbot.dto';
export declare class WhatsAppChatbotController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateChatbotFlowDto, userId: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateChatbotFlowDto): Promise<ApiResponse<any>>;
    toggle(id: string, dto: ToggleChatbotFlowDto): Promise<ApiResponse<any>>;
    list(wabaId: string, status?: string): Promise<ApiResponse<any>>;
    detail(id: string): Promise<ApiResponse<any>>;
}
