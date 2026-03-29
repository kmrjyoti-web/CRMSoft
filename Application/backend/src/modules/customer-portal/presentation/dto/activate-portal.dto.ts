import { IsIn, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ActivatePortalDto {
  @ApiProperty({ enum: ['CONTACT', 'ORGANIZATION', 'LEDGER'] })
  @IsIn(['CONTACT', 'ORGANIZATION', 'LEDGER'])
  entityType: string;

  @ApiProperty()
  @IsUUID()
  entityId: string;

  @ApiPropertyOptional({ description: 'Assign a specific menu category. Uses default if omitted.' })
  @IsOptional()
  @IsUUID()
  menuCategoryId?: string;
}
