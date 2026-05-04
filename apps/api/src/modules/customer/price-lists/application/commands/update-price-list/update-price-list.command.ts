import { UpdatePriceListDto } from '../../../presentation/dto/update-price-list.dto';

export class UpdatePriceListCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePriceListDto,
  ) {}
}
