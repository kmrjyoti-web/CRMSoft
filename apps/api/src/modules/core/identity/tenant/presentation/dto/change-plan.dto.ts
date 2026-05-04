import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePlanDto {
  @ApiProperty({ description: 'New plan ID to switch to' })
  @IsUUID()
  newPlanId: string;
}
