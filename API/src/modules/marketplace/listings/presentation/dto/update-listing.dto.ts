import {
  IsString, IsOptional, IsNumber, IsBoolean,
  IsArray, IsEnum, IsDateString, Min, IsObject, MaxLength,
} from 'class-validator';
import { VisibilityTypeEnum } from './create-listing.dto';

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

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
  mediaUrls?: any[];

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
  @IsNumber()
  @Min(0)
  stockAvailable?: number;

  @IsOptional()
  @IsEnum(VisibilityTypeEnum)
  visibility?: VisibilityTypeEnum;

  @IsOptional()
  @IsObject()
  visibilityConfig?: any;

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
  shippingConfig?: any;

  @IsOptional()
  @IsObject()
  requirementConfig?: any;

  @IsOptional()
  @IsBoolean()
  trackInventory?: boolean;
}
