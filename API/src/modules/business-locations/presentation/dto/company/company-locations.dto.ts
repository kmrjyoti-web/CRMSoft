import {
  IsString, IsOptional, IsBoolean, IsEnum, IsArray, ValidateNested, ArrayMinSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ─── Country ───────────────────────────────────────────
export class AddCountryDto {
  @ApiProperty({ example: 'IN' })
  @IsString()
  countryCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

// ─── State ─────────────────────────────────────────────
export class StateItemDto {
  @ApiProperty({ example: 'MH' })
  @IsString()
  stateCode: string;

  @ApiProperty({ enum: ['ALL_CITIES', 'SPECIFIC'], default: 'SPECIFIC' })
  @IsEnum(['ALL_CITIES', 'SPECIFIC'])
  coverageType: 'ALL_CITIES' | 'SPECIFIC';

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isHeadquarter?: boolean;

  @ApiPropertyOptional({ example: '27AAACR1234A1ZM' })
  @IsOptional()
  @IsString()
  stateGstin?: string;
}

export class AddStatesDto {
  @ApiProperty({ type: [StateItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StateItemDto)
  states: StateItemDto[];
}

// ─── City ──────────────────────────────────────────────
export class CityItemDto {
  @ApiProperty({ example: 'Mumbai' })
  @IsString()
  cityName: string;

  @ApiProperty({ enum: ['ALL_PINCODES', 'SPECIFIC'], default: 'ALL_PINCODES' })
  @IsEnum(['ALL_PINCODES', 'SPECIFIC'])
  coverageType: 'ALL_PINCODES' | 'SPECIFIC';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  district?: string;
}

export class AddCitiesDto {
  @ApiProperty({ type: [CityItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CityItemDto)
  cities: CityItemDto[];
}

// ─── Pincode ───────────────────────────────────────────
export class PincodeItemDto {
  @ApiProperty({ example: '411001' })
  @IsString()
  pincode: string;

  @ApiPropertyOptional({ example: 'Shivajinagar' })
  @IsOptional()
  @IsString()
  areaName?: string;
}

export class AddPincodesDto {
  @ApiProperty({ type: [PincodeItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PincodeItemDto)
  pincodes: PincodeItemDto[];
}

// ─── Bulk Pincodes (range) ─────────────────────────────
export class AddPincodeRangeDto {
  @ApiProperty({ example: '411001' })
  @IsString()
  fromPincode: string;

  @ApiProperty({ example: '411050' })
  @IsString()
  toPincode: string;
}

// ─── Check Area ────────────────────────────────────────
export class CheckAreaDto {
  @ApiProperty({ example: '411001' })
  @IsString()
  customerPincode: string;

  @ApiProperty({ example: 'MH' })
  @IsString()
  customerStateCode: string;
}
