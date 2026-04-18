import { AddPriceListItemDto } from '../../../presentation/dto/add-price-list-item.dto';

export class AddPriceListItemCommand {
  constructor(
    public readonly priceListId: string,
    public readonly dto: AddPriceListItemDto,
  ) {}
}
