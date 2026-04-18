import { IsDateString } from 'class-validator';

export class SnoozeFollowUpDto {
  @IsDateString()
  snoozedUntil: string;
}
