import { IsString, IsNumber, IsUUID, Min, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { RefundStatus } from '@prisma/working-client';

export class CreateRefundDto {
  @IsUUID() paymentId: string;
  @IsNumber() @Min(0.01) amount: number;
  @IsString() reason: string;
}

export class RefundQueryDto {
  @IsOptional() @IsString() paymentId?: string;
  @IsOptional() @IsEnum(RefundStatus) status?: RefundStatus;
  @IsOptional() @IsDateString() fromDate?: string;
  @IsOptional() @IsDateString() toDate?: string;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) limit?: number;
}
