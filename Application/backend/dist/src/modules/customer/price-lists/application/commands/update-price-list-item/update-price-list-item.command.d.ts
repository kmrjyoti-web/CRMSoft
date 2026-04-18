import { UpdatePriceListItemDto } from '../../../presentation/dto/update-price-list-item.dto';
export declare class UpdatePriceListItemCommand {
    readonly itemId: string;
    readonly dto: UpdatePriceListItemDto;
    constructor(itemId: string, dto: UpdatePriceListItemDto);
}
