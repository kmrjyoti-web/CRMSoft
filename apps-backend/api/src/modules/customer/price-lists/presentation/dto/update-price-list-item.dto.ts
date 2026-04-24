import { PartialType } from '@nestjs/mapped-types';
import { AddPriceListItemDto } from './add-price-list-item.dto';

export class UpdatePriceListItemDto extends PartialType(AddPriceListItemDto) {}
