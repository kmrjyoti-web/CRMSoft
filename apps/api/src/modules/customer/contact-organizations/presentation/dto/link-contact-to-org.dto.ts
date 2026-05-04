import {
  IsUUID, IsOptional, IsEnum, IsBoolean, IsString, IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LinkContactToOrgDto {
  @ApiProperty() @IsUUID()
  contactId: string;

  @ApiProperty() @IsUUID()
  organizationId: string;

  @ApiPropertyOptional({
    enum: ['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'],
    default: 'EMPLOYEE',
  })
  @IsOptional()
  @IsEnum(['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'])
  relationType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'CTO' })
  @IsOptional() @IsString()
  designation?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsOptional() @IsString()
  department?: string;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional() @IsDateString()
  startDate?: string;
}
