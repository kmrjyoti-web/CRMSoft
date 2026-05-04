import {
  IsString, IsNumber, IsOptional, IsBoolean, IsArray,
  IsUUID, ValidateNested, IsEnum, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const UnitType = [
  'PIECE', 'BOX', 'PACK', 'CARTON', 'KG', 'GRAM', 'LITRE', 'ML',
  'METER', 'CM', 'SQ_FT', 'SQ_METER', 'DOZEN', 'SET', 'PAIR',
  'ROLL', 'BUNDLE',
] as const;

class ConversionItem {
  @ApiProperty({ example: 'BOX', enum: UnitType })
  @IsString()
  fromUnit: string;

  @ApiProperty({ example: 'PIECE', enum: UnitType })
  @IsString()
  toUnit: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  @Min(0.0001)
  conversionRate: number;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class SetConversionsDto {
  @ApiProperty({ type: [ConversionItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConversionItem)
  conversions: ConversionItem[];
}

export class ConvertDto {
  @ApiProperty()
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  quantity: number;

  @ApiProperty({ example: 'BOX', enum: UnitType })
  @IsString()
  fromUnit: string;

  @ApiProperty({ example: 'PIECE', enum: UnitType })
  @IsString()
  toUnit: string;
}
