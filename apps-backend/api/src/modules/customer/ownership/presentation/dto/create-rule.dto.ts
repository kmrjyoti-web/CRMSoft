import { IsString, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';

export class CreateRuleDto {
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsString() entityType: string;
  @IsString() triggerEvent: string;
  @IsArray() conditions: Record<string, unknown>[];
  @IsString() assignmentMethod: string;
  @IsOptional() @IsString() assignToUserId?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) assignToTeamIds?: string[];
  @IsOptional() @IsString() assignToRoleId?: string;
  @IsOptional() @IsString() ownerType?: string;
  @IsOptional() @IsNumber() priority?: number;
  @IsOptional() @IsNumber() maxPerUser?: number;
  @IsOptional() @IsBoolean() respectWorkload?: boolean;
  @IsOptional() @IsNumber() escalateAfterHours?: number;
  @IsOptional() @IsString() escalateToUserId?: string;
  @IsOptional() @IsString() escalateToRoleId?: string;
}
