import {
  IsString, IsOptional, IsUUID, IsEnum, IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddCommunicationDto {
  @ApiProperty({ enum: ['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'] })
  @IsEnum(['PHONE', 'EMAIL', 'MOBILE', 'ADDRESS', 'WHATSAPP'])
  type: string;

  @ApiProperty({ example: '+91-9876543210' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ enum: ['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'] })
  @IsOptional() @IsEnum(['PRIMARY', 'WORK', 'HOME', 'PERSONAL', 'OTHER'])
  priorityType?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional() @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ example: 'Office Phone' })
  @IsOptional() @IsString()
  label?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  rawContactId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  contactId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional() @IsOptional() @IsUUID()
  leadId?: string;
}
