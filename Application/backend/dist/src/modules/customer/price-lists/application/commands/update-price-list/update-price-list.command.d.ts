import { UpdatePriceListDto } from '../../../presentation/dto/update-price-list.dto';
export declare class UpdatePriceListCommand {
    readonly id: string;
    readonly dto: UpdatePriceListDto;
    constructor(id: string, dto: UpdatePriceListDto);
}
