import { IsNotEmpty, IsString, IsOptional, IsDateString, IsInt, IsArray } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsString()
  customTaskType?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  @IsString()
  assignmentScope?: string;

  @IsOptional()
  @IsString()
  assignedDepartmentId?: string;

  @IsOptional()
  @IsString()
  assignedDesignationId?: string;

  @IsOptional()
  @IsString()
  assignedRoleId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  dueTime?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  recurrence?: string;

  @IsOptional()
  recurrenceConfig?: any;

  @IsOptional()
  @IsString()
  parentTaskId?: string;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsArray()
  tags?: string[];

  @IsOptional()
  attachments?: any[];

  @IsOptional()
  customFields?: any;

  @IsOptional()
  @IsInt()
  estimatedMinutes?: number;

  @IsOptional()
  @IsInt()
  reminderMinutesBefore?: number;

  @IsOptional()
  @IsString()
  activityType?: string;

  @IsOptional()
  @IsString()
  leadId?: string;
}
