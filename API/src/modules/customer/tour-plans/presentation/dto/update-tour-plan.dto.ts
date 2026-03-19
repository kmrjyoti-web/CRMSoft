import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateTourPlanDto {
  @IsOptional() @IsString()
  title?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsDateString()
  planDate?: string;

  @IsOptional() @IsString()
  startLocation?: string;

  @IsOptional() @IsString()
  endLocation?: string;
}
