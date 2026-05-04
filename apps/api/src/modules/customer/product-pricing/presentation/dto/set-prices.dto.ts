import {
  IsString, IsNotEmpty, IsNumber, IsOptional, IsUUID,
  IsEnum, IsArray, ValidateNested, IsDateString, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PriceTypeEnum {
  MRP = 'MRP',
  SALE_PRICE = 'SALE_PRICE',
  PURCHASE_PRICE = 'PURCHASE_PRICE',
  DEALER_PRICE = 'DEALER_PRICE',
  DISTRIBUTOR_PRICE = 'DISTRIBUTOR_PRICE',
  SPECIAL_PRICE = 'SPECIAL_PRICE',
}

export class PriceEntryDto {
  @ApiProperty({ enum: PriceTypeEnum, example: 'SALE_PRICE' })
  @IsEnum(PriceTypeEnum)
  @IsNotEmpty()
  priceType: PriceTypeEnum;

  @ApiProperty({ example: 1499.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;

  @ApiPropertyOptional({ description: 'Customer price group UUID' })
  @IsOptional()
  @IsUUID()
  priceGroupId?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQty?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxQty?: number;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  validTo?: string;
}

export class SetPricesDto {
  @ApiProperty({ type: [PriceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceEntryDto)
  prices: PriceEntryDto[];
}

export class BulkPriceUpdateDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        productId: { type: 'string', format: 'uuid' },
        prices: { type: 'array', items: { $ref: '#/components/schemas/PriceEntryDto' } },
      },
    },
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPriceItemDto)
  updates: BulkPriceItemDto[];
}

export class BulkPriceItemDto {
  @ApiProperty({ description: 'Product UUID' })
  @IsUUID()
  productId: string;

  @ApiProperty({ type: [PriceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceEntryDto)
  prices: PriceEntryDto[];
}

export class SetSlabPriceEntryDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minQty: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxQty?: number;

  @ApiProperty({ example: 899.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  amount: number;
}

export class SetSlabPricesDto {
  @ApiProperty({ enum: PriceTypeEnum })
  @IsEnum(PriceTypeEnum)
  priceType: PriceTypeEnum;

  @ApiProperty({ type: [SetSlabPriceEntryDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetSlabPriceEntryDto)
  slabs: SetSlabPriceEntryDto[];
}
