import { IsString, IsOptional, IsNumber, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class LogNegotiationDto {
  @ApiProperty() @IsIn(['PRICE_CHANGE', 'ITEM_CHANGE', 'TERM_CHANGE', 'DISCOUNT_REQUEST', 'COUNTER_OFFER', 'REQUIREMENT', 'GENERAL_NOTE'])
  negotiationType: string;

  @ApiPropertyOptional() @IsOptional() @IsString() customerRequirement?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) customerBudget?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) customerPriceExpected?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) ourPrice?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) proposedDiscount?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Type(() => Number) counterOfferAmount?: number;
  @ApiPropertyOptional() @IsOptional() itemsAdded?: any;
  @ApiPropertyOptional() @IsOptional() itemsRemoved?: any;
  @ApiPropertyOptional() @IsOptional() itemsModified?: any;
  @ApiPropertyOptional() @IsOptional() @IsString() termsChanged?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() outcome?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPersonId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() contactPersonName?: string;
}
