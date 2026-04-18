import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateListingDto } from './dto/create-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
export declare class ListingsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    create(dto: CreateListingDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    findAll(tenantId: string, page?: string, limit?: string, status?: string, listingType?: string, categoryId?: string, search?: string, authorId?: string): Promise<ApiResponse<unknown[]>>;
    findOne(id: string, tenantId: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateListingDto, userId: string, tenantId: string): Promise<ApiResponse<any>>;
    publish(id: string, userId: string, tenantId: string): Promise<ApiResponse<any>>;
}
