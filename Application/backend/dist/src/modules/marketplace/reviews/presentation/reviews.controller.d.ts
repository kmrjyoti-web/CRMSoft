import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateReviewDto } from './dto/create-review.dto';
export declare class ReviewsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateReviewDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    findAll(tenantId: string, listingId?: string, status?: string, page?: string, limit?: string): Promise<ApiResponse<unknown[]>>;
    approve(id: string, body: {
        note?: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<null>>;
    reject(id: string, body: {
        note: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<null>>;
    flag(id: string, body: {
        note: string;
    }, userId: string, tenantId: string): Promise<ApiResponse<null>>;
}
