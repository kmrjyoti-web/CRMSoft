import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray,
  IsEnum, IsDateString, Min, IsObject, MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ListingTypeEnum {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  REQUIREMENT = 'REQUIREMENT',
  JOB = 'JOB',
}

export enum VisibilityTypeEnum {
  PUBLIC = 'PUBLIC',
  GEO_TARGETED = 'GEO_TARGETED',
  VERIFIED_ONLY = 'VERIFIED_ONLY',
  MY_CONTACTS = 'MY_CONTACTS',
  SELECTED_CONTACTS = 'SELECTED_CONTACTS',
  CATEGORY_BASED = 'CATEGORY_BASED',
  GRADE_BASED = 'GRADE_BASED',
}

export class PriceTierDto {
  @IsString()
  label: string;

  @IsNumber()
  @Min(1)
  minQty: number;

  @IsOptional()
  @IsNumber()
  maxQty?: number;

  @IsNumber()
  @Min(0)
  pricePerUnit: number;

  @IsOptional()
  @IsBoolean()
  requiresVerification?: boolean;
}

export class CreateListingDto {
  @IsEnum(ListingTypeEnum)
  listingType: ListingTypeEnum;

  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  subcategoryId?: string;

  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  mrp?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  minOrderQty?: number;

  @IsOptional()
  @IsNumber()
  maxOrderQty?: number;

  @IsOptional()
  @IsString()
  hsnCode?: string;

  @IsOptional()
  @IsNumber()
  gstRate?: number;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockAvailable?: number;

  @IsOptional()
  @IsEnum(VisibilityTypeEnum)
  visibility?: VisibilityTypeEnum;

  @IsOptional()
  @IsObject()
  visibilityConfig?: Record<string, unknown>;

  @IsOptional()
  @IsDateString()
  publishAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @IsOptional()
  @IsObject()
  attributes?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsObject()
  shippingConfig?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  requirementConfig?: Record<string, unknown>;

  @IsOptional()
  @IsArray()
  @Type(() => PriceTierDto)
  priceTiers?: PriceTierDto[];
}
