import { IsString, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class VisitDto {
  @IsOptional() @IsString()
  leadId?: string;

  @IsOptional() @IsString()
  contactId?: string;

  @IsOptional() @IsDateString()
  scheduledTime?: string;

  @IsOptional()
  sortOrder?: number;
}

export class CreateTourPlanDto {
  @IsString()
  title: string;

  @IsDateString()
  planDate: string;

  @IsString()
  leadId: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  startLocation?: string;

  @IsOptional() @IsString()
  endLocation?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => VisitDto)
  visits?: VisitDto[];
}
