import { IsOptional, IsUUID, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyRawContactDto {
  @ApiPropertyOptional({ description: 'Link to existing Organization' })
  @IsOptional() @IsUUID()
  organizationId?: string;

  @ApiPropertyOptional({
    enum: ['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'],
  })
  @IsOptional()
  @IsEnum(['PRIMARY_CONTACT', 'EMPLOYEE', 'CONSULTANT', 'PARTNER', 'VENDOR', 'DIRECTOR', 'FOUNDER'])
  contactOrgRelationType?: string;
}
