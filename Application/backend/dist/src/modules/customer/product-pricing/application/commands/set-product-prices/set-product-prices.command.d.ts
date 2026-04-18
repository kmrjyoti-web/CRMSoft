import { PriceEntryDto } from '../../../presentation/dto/set-prices.dto';
export declare class SetProductPricesCommand {
    readonly productId: string;
    readonly prices: PriceEntryDto[];
    constructor(productId: string, prices: PriceEntryDto[]);
}
