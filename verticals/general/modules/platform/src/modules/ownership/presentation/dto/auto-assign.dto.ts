import { IsString } from 'class-validator';

export class AutoAssignDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsString() triggerEvent: string;
}
