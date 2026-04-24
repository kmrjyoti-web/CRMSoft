import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class UpdateFollowUpDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsDateString()
  dueDate?: string;

  @IsOptional() @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;
}
