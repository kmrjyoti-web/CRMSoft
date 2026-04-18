import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateQuickReplyDto } from './dto/quick-reply.dto';
export declare class WhatsAppQuickRepliesController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateQuickReplyDto, userId: string): Promise<ApiResponse<any>>;
    list(wabaId: string, category?: string): Promise<ApiResponse<any>>;
}
