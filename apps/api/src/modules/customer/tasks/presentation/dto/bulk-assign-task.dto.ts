import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class BulkAssignTaskDto {
  @IsArray()
  @IsNotEmpty()
  taskIds: string[];

  @IsString()
  @IsNotEmpty()
  assignedToId: string;
}
