import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AllocateLeadDto {
  @ApiProperty({ description: 'User ID of the sales executive' })
  @IsUUID()
  allocatedToId: string;
}
