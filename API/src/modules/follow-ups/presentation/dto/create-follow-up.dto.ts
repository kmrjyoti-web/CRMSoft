import { IsString, IsOptional, IsDateString, IsIn } from 'class-validator';

export class CreateFollowUpDto {
  @IsString()
  title: string;

  @IsDateString()
  dueDate: string;

  @IsString()
  assignedToId: string;

  @IsString()
  entityType: string;

  @IsString()
  entityId: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
  priority?: string;
}
