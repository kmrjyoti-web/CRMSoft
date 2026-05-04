import { IsString } from 'class-validator';

export class ReassignFollowUpDto {
  @IsString()
  newAssigneeId: string;
}
