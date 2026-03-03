import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { PaginationDto } from '../../../../common/dto/pagination.dto';

export class LeadQueryDto extends PaginationDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Comma-separated statuses: NEW,VERIFIED,ALLOCATED,IN_PROGRESS,DEMO_SCHEDULED,QUOTATION_SENT,NEGOTIATION,WON,LOST,ON_HOLD',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated priorities: LOW,MEDIUM,HIGH,URGENT',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({ description: 'Filter by assigned sales executive' })
  @IsOptional() @IsUUID()
  allocatedToId?: string;

  @ApiPropertyOptional({ description: 'Filter by contact' })
  @IsOptional() @IsUUID()
  contactId?: string;

  @ApiPropertyOptional({ description: 'Filter by organization' })
  @IsOptional() @IsUUID()
  organizationId?: string;
}
