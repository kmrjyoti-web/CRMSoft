import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ApplyCouponDto {
  @IsString()
  code: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  rechargeAmount?: number;
}
