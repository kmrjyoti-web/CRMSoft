import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeDto {
  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsUUID()
  planId: string;
}
