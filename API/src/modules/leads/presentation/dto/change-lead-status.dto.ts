import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangeLeadStatusDto {
  @ApiProperty({
    enum: ['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED',
           'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'],
  })
  @IsEnum(['NEW', 'VERIFIED', 'ALLOCATED', 'IN_PROGRESS', 'DEMO_SCHEDULED',
           'QUOTATION_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ON_HOLD'])
  status: string;

  @ApiPropertyOptional({ description: 'Required when status = LOST' })
  @IsOptional() @IsString()
  reason?: string;
}
