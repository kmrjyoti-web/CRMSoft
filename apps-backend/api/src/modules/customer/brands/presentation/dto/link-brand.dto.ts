import { IsUUID, IsOptional, IsBoolean, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LinkBrandOrganizationDto {
  @ApiProperty()
  @IsUUID()
  organizationId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}

export class LinkBrandContactDto {
  @ApiProperty()
  @IsUUID()
  contactId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}
