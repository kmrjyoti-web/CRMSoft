import { PriceEntryDto } from '../../../presentation/dto/set-prices.dto';

export class SetProductPricesCommand {
  constructor(
    public readonly productId: string,
    public readonly prices: PriceEntryDto[],
  ) {}
}
