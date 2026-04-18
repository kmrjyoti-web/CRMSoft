import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateCampaignDto, UpdateCampaignDto, AddCampaignRecipientsDto, CampaignQueryDto, CampaignRecipientQueryDto } from './dto/campaign.dto';
export declare class EmailCampaignController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateCampaignDto, user: any): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateCampaignDto): Promise<ApiResponse<any>>;
    addRecipients(id: string, dto: AddCampaignRecipientsDto): Promise<ApiResponse<any>>;
    start(id: string, userId: string): Promise<ApiResponse<any>>;
    pause(id: string): Promise<ApiResponse<any>>;
    cancel(id: string): Promise<ApiResponse<any>>;
    list(query: CampaignQueryDto, userId: string): Promise<ApiResponse<unknown[]>>;
    unsubscribes(page?: number, limit?: number): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    stats(id: string): Promise<ApiResponse<any>>;
    recipients(id: string, query: CampaignRecipientQueryDto): Promise<ApiResponse<unknown[]>>;
}
