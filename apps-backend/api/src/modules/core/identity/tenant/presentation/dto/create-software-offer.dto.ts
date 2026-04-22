import {
  IsString, IsOptional, IsEnum, IsInt, IsDateString,
  IsArray, IsBoolean, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OfferType } from '@prisma/platform-client';

export class CreateSoftwareOfferDto {
  @ApiProperty({ description: 'Offer name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Unique offer code' })
  @IsString()
  code: string;

  @ApiPropertyOptional({ description: 'Offer description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: OfferType, description: 'Type of offer' })
  @IsEnum(OfferType)
  offerType: string;

  @ApiProperty({ description: 'Offer value (percentage or flat amount)' })
  @IsInt()
  @Min(1)
  value: number;

  @ApiPropertyOptional({ description: 'Plan IDs this offer applies to', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicablePlanIds?: string[];

  @ApiProperty({ description: 'Offer valid from date (ISO 8601)' })
  @IsDateString()
  validFrom: string;

  @ApiProperty({ description: 'Offer valid to date (ISO 8601)' })
  @IsDateString()
  validTo: string;

  @ApiPropertyOptional({ description: 'Maximum number of redemptions (0 = unlimited)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  maxRedemptions?: number;

  @ApiPropertyOptional({ description: 'Whether the offer is auto-applied' })
  @IsOptional()
  @IsBoolean()
  autoApply?: boolean;

  @ApiPropertyOptional({ description: 'Terms and conditions' })
  @IsOptional()
  @IsString()
  terms?: string;
}
