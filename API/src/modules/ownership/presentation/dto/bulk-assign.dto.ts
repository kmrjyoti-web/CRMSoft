import { IsString, IsArray } from 'class-validator';

export class BulkAssignDto {
  @IsString() entityType: string;
  @IsArray() @IsString({ each: true }) entityIds: string[];
  @IsString() userId: string;
  @IsString() ownerType: string;
  @IsString() reason: string;
}
