import { IsString, IsEnum, IsInt, IsOptional, IsNumber, Min } from 'class-validator';

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

  @IsOptional()
  isActive?: boolean;
}
