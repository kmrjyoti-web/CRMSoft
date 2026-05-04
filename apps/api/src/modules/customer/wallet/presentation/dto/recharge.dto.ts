import { IsString, IsOptional } from 'class-validator';

export class InitiateRechargeDto {
  @IsString()
  planId: string;

  @IsString()
  @IsOptional()
  couponCode?: string;
}

export class CompleteRechargeDto {
  @IsString()
  planId: string;

  @IsString()
  paymentId: string;

  @IsString()
  @IsOptional()
  couponCode?: string;
}
