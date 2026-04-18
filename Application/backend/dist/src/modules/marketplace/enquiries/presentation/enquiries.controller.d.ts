import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateEnquiryDto } from './dto/create-enquiry.dto';
export declare class EnquiriesController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateEnquiryDto, userId: string, tenantId: string): Promise<ApiResponse<{
        id: any;
    }>>;
    findAll(tenantId: string, listingId?: string, status?: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    convert(id: string, body: {
        crmLeadId?: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<null>>;
}
