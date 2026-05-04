import {
  IsString, IsOptional, IsUUID, IsEnum, IsNumber,
  IsDateString, IsArray, Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLeadDto {
  @ApiProperty({ description: 'Contact ID (verified contact)' })
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional({ description: 'Organization ID' })
  @IsOptional() @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({ enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' })
  @IsOptional() @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Expected deal value' })
  @IsOptional() @IsNumber() @Min(0)
  expectedValue?: number;

  @ApiPropertyOptional({ example: '2026-06-30', description: 'Expected close date' })
  @IsOptional() @IsDateString()
  expectedCloseDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [String], description: 'LookupValue IDs for filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
