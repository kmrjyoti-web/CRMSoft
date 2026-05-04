import {
  IsString, IsOptional, IsArray, IsEnum, IsBoolean,
  ValidateNested, MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ContactCommunicationDto {
  @ApiProperty({ enum: ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'] })
  @IsEnum(['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'])
  type: string;

  @ApiProperty({ example: 'vikram@techcorp.in' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ enum: ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'] })
  @IsOptional() @IsEnum(['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'])
  priorityType?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  label?: string;

  @ApiPropertyOptional() @IsOptional() @IsBoolean()
  isPrimary?: boolean;
}

export class CreateContactDto {
  @ApiProperty({ example: 'Vikram' })
  @IsString() @MinLength(1)
  firstName: string;

  @ApiProperty({ example: 'Sharma' })
  @IsString() @MinLength(1)
  lastName: string;

  @ApiPropertyOptional({ example: 'CTO' })
  @IsOptional() @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  notes?: string;

  @ApiPropertyOptional({ type: [ContactCommunicationDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true })
  @Type(() => ContactCommunicationDto)
  communications?: ContactCommunicationDto[];

  @ApiPropertyOptional({ description: 'Link to existing Organization' })
  @IsOptional() @IsString()
  organizationId?: string;

  @ApiPropertyOptional({
    enum: ['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'],
  })
  @IsOptional()
  @IsEnum(['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'])
  orgRelationType?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray()
  filterIds?: string[];
}
