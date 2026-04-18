import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateOfferDto } from './dto/create-offer.dto';
export declare class OffersController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateOfferDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    findAll(tenantId: string, page?: string, limit?: string, status?: string, offerType?: string): Promise<ApiResponse<unknown[]>>;
    findOne(id: string, tenantId: string): Promise<ApiResponse<any>>;
    activate(id: string, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    redeem(id: string, body: {
        orderId?: string;
        orderValue?: number;
        quantity?: number;
        city?: string;
        state?: string;
        pincode?: string;
        deviceType?: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    checkEligibility(id: string, userId: string, tenantId: string, orderValue?: string, quantity?: string, city?: string, state?: string): Promise<ApiResponse<any>>;
}
