import { IsOptional, IsString, IsDateString, IsNumberString } from 'class-validator';

export class EventQueryDto {
  @IsOptional() @IsNumberString()
  page?: string;

  @IsOptional() @IsNumberString()
  limit?: string;

  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsDateString()
  startDate?: string;

  @IsOptional() @IsDateString()
  endDate?: string;

  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @IsString()
  sortBy?: string;

  @IsOptional() @IsString()
  sortOrder?: string;
}
