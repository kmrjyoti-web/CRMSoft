import { AddPriceListItemDto } from '../../../presentation/dto/add-price-list-item.dto';
export declare class AddPriceListItemCommand {
    readonly priceListId: string;
    readonly dto: AddPriceListItemDto;
    constructor(priceListId: string, dto: AddPriceListItemDto);
}
