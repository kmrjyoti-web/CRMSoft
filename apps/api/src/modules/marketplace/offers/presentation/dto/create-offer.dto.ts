import {
  IsString, IsOptional, IsNumber, IsBoolean, IsArray,
  IsEnum, IsDateString, Min, IsObject, MaxLength,
} from 'class-validator';

export enum OfferTypeEnum {
  ONE_TIME = 'ONE_TIME',
  DAILY_RECURRING = 'DAILY_RECURRING',
  WEEKLY_RECURRING = 'WEEKLY_RECURRING',
  FIRST_N_ORDERS = 'FIRST_N_ORDERS',
  LAUNCH = 'LAUNCH',
  CUSTOM = 'CUSTOM',
}

export enum DiscountTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FLAT_AMOUNT = 'FLAT_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  BUY_X_GET_Y = 'BUY_X_GET_Y',
  BUNDLE_PRICE = 'BUNDLE_PRICE',
}

export class CreateOfferDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  mediaUrls?: string[];

  @IsEnum(OfferTypeEnum)
  offerType: OfferTypeEnum;

  @IsEnum(DiscountTypeEnum)
  discountType: DiscountTypeEnum;

  @IsNumber()
  @Min(0)
  discountValue: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedListingIds?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedCategoryIds?: string[];

  @IsOptional()
  @IsString()
  primaryListingId?: string;

  @IsOptional()
  @IsObject()
  conditions?: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxRedemptions?: number;

  @IsOptional()
  @IsBoolean()
  autoCloseOnLimit?: boolean;

  @IsOptional()
  @IsString()
  resetTime?: string;

  @IsOptional()
  @IsDateString()
  publishAt?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
