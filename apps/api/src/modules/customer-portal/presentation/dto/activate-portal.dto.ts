import { IsIn, IsUUID, IsOptional, IsArray, IsString } from 'class-validator';
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

  @ApiPropertyOptional({
    description: 'Delivery channels for credentials (plugins currently stubbed — status=QUEUED_AWAITING_PLUGIN_IMPL).',
    isArray: true,
    enum: ['EMAIL', 'WHATSAPP'],
  })
  @IsOptional()
  @IsArray()
  @IsIn(['EMAIL', 'WHATSAPP'], { each: true })
  channels?: ('EMAIL' | 'WHATSAPP')[];

  @ApiPropertyOptional({ description: 'Optional custom message included in the delivered invite body.' })
  @IsOptional()
  @IsString()
  customMessage?: string;
}
