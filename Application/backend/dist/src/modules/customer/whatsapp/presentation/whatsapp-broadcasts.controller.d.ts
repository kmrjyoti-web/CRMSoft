import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateBroadcastDto, AddBroadcastRecipientsDto, BroadcastQueryDto, BroadcastRecipientQueryDto } from './dto/broadcast.dto';
export declare class WhatsAppBroadcastsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateBroadcastDto, user: any): Promise<ApiResponse<any>>;
    addRecipients(id: string, dto: AddBroadcastRecipientsDto): Promise<ApiResponse<any>>;
    start(id: string, userId: string): Promise<ApiResponse<null>>;
    pause(id: string): Promise<ApiResponse<null>>;
    cancel(id: string): Promise<ApiResponse<null>>;
    list(dto: BroadcastQueryDto): Promise<ApiResponse<unknown[]>>;
    detail(id: string): Promise<ApiResponse<any>>;
    recipients(id: string, dto: BroadcastRecipientQueryDto): Promise<ApiResponse<unknown[]>>;
}
