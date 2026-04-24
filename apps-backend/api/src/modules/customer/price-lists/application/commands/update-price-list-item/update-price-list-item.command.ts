import { UpdatePriceListItemDto } from '../../../presentation/dto/update-price-list-item.dto';

export class UpdatePriceListItemCommand {
  constructor(
    public readonly itemId: string,
    public readonly dto: UpdatePriceListItemDto,
  ) {}
}
