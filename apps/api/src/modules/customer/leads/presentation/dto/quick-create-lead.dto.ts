import {
  IsString, IsOptional, IsUUID, IsEnum, IsNumber,
  IsDateString, IsArray, Min, MinLength, ValidateNested,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InlineContactDto {
  @ApiProperty({ description: 'First name' })
  @IsString()
  @MinLength(1)
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString()
  @MinLength(1)
  lastName: string;

  @ApiProperty({ description: 'Mobile number' })
  @IsString()
  @MinLength(1)
  mobile: string;
}

export class InlineOrganizationDto {
  @ApiProperty({ description: 'Organization name' })
  @IsString()
  @MinLength(2)
  name: string;
}

export class QuickCreateLeadDto {
  @ApiPropertyOptional({ description: 'Existing contact ID (provide this OR inlineContact)' })
  @IsOptional()
  @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Inline contact data for quick creation' })
  @IsOptional()
  @ValidateNested()
  @Type(() => InlineContactDto)
  inlineContact?: InlineContactDto;

  @ApiPropertyOptional({ description: 'Existing organization ID' })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ description: 'Inline organization data for quick creation' })
  @IsOptional()
  @ValidateNested()
  @Type(() => InlineOrganizationDto)
  inlineOrganization?: InlineOrganizationDto;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Expected deal value' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  expectedValue?: number;

  @ApiPropertyOptional({ example: '2026-06-30', description: 'Expected close date' })
  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'LookupValue IDs for filters' })
  @IsOptional()
  @IsArray()
  filterIds?: string[];
}
