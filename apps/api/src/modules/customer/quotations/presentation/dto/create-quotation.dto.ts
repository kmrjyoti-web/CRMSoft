import { IsString, IsOptional, IsArray, IsNumber, IsDateString, ValidateNested, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateLineItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiProperty() @IsString() productName: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) quantity: number;
  @ApiPropertyOptional() @IsOptional() @IsString() unit?: string;
  @ApiProperty() @IsNumber() @Type(() => Number) unitPrice: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) mrp?: number;
  @ApiPropertyOptional() @IsOptional() @IsIn(['PERCENTAGE', 'FLAT']) discountType?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) discountValue?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) gstRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) cessRate?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isOptional?: boolean;
  @ApiPropertyOptional() @IsOptional() @IsString() notes?: string;
}

export class CreateQuotationDto {
  @ApiProperty() @IsString() leadId: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPersonId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() organizationId?: string;
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
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateLineItemDto) items?: CreateLineItemDto[];
  @ApiPropertyOptional() @IsOptional() @IsArray() @IsString({ each: true }) tags?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() internalNotes?: string;
}
