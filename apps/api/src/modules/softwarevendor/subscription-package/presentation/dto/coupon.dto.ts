import {
  IsString, IsOptional, IsNumber, IsBoolean, IsInt,
  IsEnum, IsArray, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ValidateCouponDto {
  @IsString()
  couponCode: string;

  @IsString()
  @IsOptional()
  packageCode?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  amount?: number;
}

export class RedeemCouponDto {
  @IsString()
  couponCode: string;

  @IsNumber()
  @Min(0)
  discountApplied: number;
}

export class CreateCouponDto {
  @IsString()
  code: string;

  @IsEnum(['FIXED_TOKENS', 'PERCENTAGE'])
  type: 'FIXED_TOKENS' | 'PERCENTAGE';

  @IsInt()
  @Min(1)
  value: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxUses?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minRecharge?: number;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERCENT', 'FLAT_INR'])
  @IsOptional()
  discountType?: 'PERCENT' | 'FLAT_INR';

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountInr?: number;

  @IsArray()
  @IsOptional()
  applicablePackages?: string[];

  @IsArray()
  @IsOptional()
  applicableTypes?: string[];

  @IsString()
  @IsOptional()
  validFrom?: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  perUserLimit?: number;

  @IsBoolean()
  @IsOptional()
  firstTimeOnly?: boolean;

  @IsString()
  @IsOptional()
  packageId?: string;
}

export class UpdateCouponDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsEnum(['FIXED_TOKENS', 'PERCENTAGE'])
  @IsOptional()
  type?: 'FIXED_TOKENS' | 'PERCENTAGE';

  @IsInt()
  @IsOptional()
  @Min(1)
  value?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  maxUses?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  minRecharge?: number;

  @IsString()
  @IsOptional()
  expiresAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['PERCENT', 'FLAT_INR'])
  @IsOptional()
  discountType?: 'PERCENT' | 'FLAT_INR';

  @IsNumber()
  @IsOptional()
  @Min(0)
  discountValue?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  maxDiscountInr?: number;

  @IsArray()
  @IsOptional()
  applicablePackages?: string[];

  @IsArray()
  @IsOptional()
  applicableTypes?: string[];

  @IsString()
  @IsOptional()
  validFrom?: string;

  @IsString()
  @IsOptional()
  validUntil?: string;

  @IsInt()
  @IsOptional()
  @Min(1)
  perUserLimit?: number;

  @IsBoolean()
  @IsOptional()
  firstTimeOnly?: boolean;

  @IsString()
  @IsOptional()
  packageId?: string;
}

export class CouponListQueryDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean;

  @IsString()
  @IsOptional()
  search?: string;
}
