import { IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTenantSettingsDto {
  @ApiProperty({ description: 'Tenant settings object', type: Object })
  @IsObject()
  settings: Record<string, any>;
}
