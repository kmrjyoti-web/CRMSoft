import { IsOptional, IsString, IsInt } from 'class-validator';

export class CompleteTaskDto {
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @IsOptional()
  @IsInt()
  actualMinutes?: number;
}
