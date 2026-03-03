import {
  IsString, IsOptional, IsBoolean, IsNumber, IsEnum,
  IsUUID, IsArray, IsInt, MinLength, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TaxTypeEnum {
  GST = 'GST',
  IGST = 'IGST',
  EXEMPT = 'EXEMPT',
  ZERO_RATED = 'ZERO_RATED',
  COMPOSITE = 'COMPOSITE',
}

export enum UnitTypeEnum {
  PIECE = 'PIECE',
  BOX = 'BOX',
  PACK = 'PACK',
  CARTON = 'CARTON',
  KG = 'KG',
  GRAM = 'GRAM',
  LITRE = 'LITRE',
  ML = 'ML',
  METER = 'METER',
  CM = 'CM',
  SQ_FT = 'SQ_FT',
  SQ_METER = 'SQ_METER',
  DOZEN = 'DOZEN',
  SET = 'SET',
  PAIR = 'PAIR',
}

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Mouse Pro' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiPropertyOptional({ example: 'PRD-00001' })
  @IsOptional() @IsString()
  code?: string;

  @ApiPropertyOptional({ example: 'Ergonomic wireless mouse' })
  @IsOptional() @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ example: 'Full product description...' })
  @IsOptional() @IsString()
  description?: string;

  // Hierarchy
  @ApiPropertyOptional({ description: 'Parent product UUID' })
  @IsOptional() @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isMaster?: boolean;

  // Media
  @ApiPropertyOptional({ example: 'https://cdn.example.com/image.jpg' })
  @IsOptional() @IsString()
  image?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  brochureUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  videoUrl?: string;

  // Pricing
  @ApiPropertyOptional({ example: 1999.00 })
  @IsOptional() @IsNumber() @Type(() => Number)
  mrp?: number;

  @ApiPropertyOptional({ example: 1499.00 })
  @IsOptional() @IsNumber() @Type(() => Number)
  salePrice?: number;

  @ApiPropertyOptional({ example: 800.00 })
  @IsOptional() @IsNumber() @Type(() => Number)
  purchasePrice?: number;

  @ApiPropertyOptional({ example: 750.00 })
  @IsOptional() @IsNumber() @Type(() => Number)
  costPrice?: number;

  // Tax
  @ApiPropertyOptional({ enum: TaxTypeEnum, default: TaxTypeEnum.GST })
  @IsOptional() @IsEnum(TaxTypeEnum)
  taxType?: TaxTypeEnum;

  @ApiPropertyOptional({ example: '84713010' })
  @IsOptional() @IsString()
  hsnCode?: string;

  @ApiPropertyOptional({ example: 18.00 })
  @IsOptional() @IsNumber() @Type(() => Number)
  gstRate?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsNumber() @Type(() => Number)
  cessRate?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  taxInclusive?: boolean;

  // Units
  @ApiPropertyOptional({ enum: UnitTypeEnum, default: UnitTypeEnum.PIECE })
  @IsOptional() @IsEnum(UnitTypeEnum)
  primaryUnit?: UnitTypeEnum;

  @ApiPropertyOptional({ enum: UnitTypeEnum })
  @IsOptional() @IsEnum(UnitTypeEnum)
  secondaryUnit?: UnitTypeEnum;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional() @IsNumber() @Type(() => Number)
  conversionFactor?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number)
  minOrderQty?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number)
  maxOrderQty?: number;

  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number)
  weight?: number;

  // Packing
  @ApiPropertyOptional({ example: 10 })
  @IsOptional() @IsInt() @Type(() => Number)
  packingSize?: number;

  @ApiPropertyOptional({ enum: UnitTypeEnum })
  @IsOptional() @IsEnum(UnitTypeEnum)
  packingUnit?: UnitTypeEnum;

  @ApiPropertyOptional() @IsOptional() @IsString()
  packingDescription?: string;

  @ApiPropertyOptional({ example: '8901234567890' })
  @IsOptional() @IsString()
  barcode?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  batchTracking?: boolean;

  // License & Sale Rules
  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  licenseRequired?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString()
  licenseType?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  licenseNumber?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  individualSale?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional() @IsBoolean()
  isReturnable?: boolean;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  warrantyMonths?: number;

  @ApiPropertyOptional({ example: 365 })
  @IsOptional() @IsInt() @Min(0) @Type(() => Number)
  shelfLifeDays?: number;

  // Relations
  @ApiPropertyOptional({ description: 'Brand UUID' })
  @IsOptional() @IsUUID()
  brandId?: string;

  @ApiPropertyOptional({ description: 'Manufacturer UUID' })
  @IsOptional() @IsUUID()
  manufacturerId?: string;

  // Meta
  @ApiPropertyOptional({ type: [String], example: ['electronics', 'wireless'] })
  @IsOptional() @IsArray() @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ example: 0 })
  @IsOptional() @IsInt() @Type(() => Number)
  sortOrder?: number;
}
