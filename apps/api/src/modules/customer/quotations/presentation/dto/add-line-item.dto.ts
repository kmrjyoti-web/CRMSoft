import { IsString, IsOptional, IsNumber, IsIn, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AddLineItemDto {
  @ApiPropertyOptional() @IsOptional() @IsString() productId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() productName?: string;
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
