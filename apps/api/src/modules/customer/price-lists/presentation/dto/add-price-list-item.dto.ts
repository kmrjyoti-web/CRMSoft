import { IsString, IsNumber, IsOptional } from 'class-validator';

export class AddPriceListItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  sellingPrice: number;

  @IsOptional() @IsNumber()
  minQuantity?: number;

  @IsOptional() @IsNumber()
  maxQuantity?: number;

  @IsOptional() @IsNumber()
  marginPercent?: number;
}
