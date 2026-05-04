import {
  IsString, IsOptional, IsEnum, IsArray, ValidateNested, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CommunicationItemDto {
  @ApiProperty({ enum: ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'] })
  @IsEnum(['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'])
  type: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ enum: ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'] })
  @IsOptional() @IsEnum(['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'])
  priorityType?: string;

  @ApiPropertyOptional({ example: 'Office Phone' })
  @IsOptional() @IsString()
  label?: string;
}

export class CreateRawContactDto {
  @ApiProperty({ example: 'Vikram' })
  @IsString() @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString() @MinLength(1)
  lastName: string;

  @ApiPropertyOptional({ enum: ['MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API'] })
  @IsOptional() @IsEnum(['MANUAL', 'BULK_IMPORT', 'WEB_FORM', 'REFERRAL', 'API'])
  source?: string;

  @ApiPropertyOptional({ example: 'TechCorp India' })
  @IsOptional() @IsString()
  companyName?: string;

  @ApiPropertyOptional({ example: 'CTO' })
  @IsOptional() @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [CommunicationItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CommunicationItemDto)
  communications?: CommunicationItemDto[];

  @ApiPropertyOptional({ type: [String], description: 'LookupValue IDs for filters' })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
