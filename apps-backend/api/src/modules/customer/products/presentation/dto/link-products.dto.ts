import { IsUUID, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProductRelationType {
  VARIANT = 'VARIANT',
  ACCESSORY = 'ACCESSORY',
  UPSELL = 'UPSELL',
  CROSS_SELL = 'CROSS_SELL',
  BUNDLE_ITEM = 'BUNDLE_ITEM',
  SUBSTITUTE = 'SUBSTITUTE',
}

export class LinkProductsDto {
  @ApiProperty({ description: 'Target product UUID' })
  @IsUUID()
  toProductId: string;

  @ApiProperty({ enum: ProductRelationType })
  @IsEnum(ProductRelationType)
  relationType: ProductRelationType;
}
