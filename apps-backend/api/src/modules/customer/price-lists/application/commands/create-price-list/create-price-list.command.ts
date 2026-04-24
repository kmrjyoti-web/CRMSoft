import { CreatePriceListDto } from '../../../presentation/dto/create-price-list.dto';

export class CreatePriceListCommand {
  constructor(
    public readonly dto: CreatePriceListDto,
    public readonly createdById: string,
  ) {}
}
