import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';
import { PriceListQueryDto } from './dto/price-list-query.dto';
import { AddPriceListItemDto } from './dto/add-price-list-item.dto';
import { UpdatePriceListItemDto } from './dto/update-price-list-item.dto';
export declare class PriceListsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    list(query: PriceListQueryDto): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    create(dto: CreatePriceListDto, userId: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdatePriceListDto): Promise<ApiResponse<any>>;
    remove(id: string): Promise<ApiResponse<any>>;
    addItem(priceListId: string, dto: AddPriceListItemDto): Promise<ApiResponse<any>>;
    updateItem(itemId: string, dto: UpdatePriceListItemDto): Promise<ApiResponse<any>>;
    removeItem(itemId: string): Promise<ApiResponse<any>>;
}
