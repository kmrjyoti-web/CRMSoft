import { IsString, IsOptional, IsArray, IsNumber, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateQuotationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() summary?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() coverNote?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['FIXED', 'RANGE', 'NEGOTIABLE']) priceType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) minAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) maxAmount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) plusMinusPercent?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validFrom?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() validUntil?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() paymentTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() deliveryTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() warrantyTerms?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() termsConditions?: string;
  @ApiPropertyOptional() @IsOptional() @IsIn(['PERCENTAGE', 'FLAT']) discountType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) discountValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() internalNotes?: string;
}
