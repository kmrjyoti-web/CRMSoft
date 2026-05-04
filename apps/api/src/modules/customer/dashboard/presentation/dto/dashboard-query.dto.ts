import { IsOptional, IsString, IsDateString } from 'class-validator';

export class DashboardQueryDto {
  @IsDateString()
  dateFrom: string;

  @IsDateString()
  dateTo: string;

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  groupBy?: string;

  @IsOptional() @IsString()
  source?: string;

  @IsOptional() @IsString()
  activityType?: string;

  @IsOptional() @IsString()
  metric?: string;

  @IsOptional() @IsString()
  period?: string;

  @IsOptional() @IsString()
  roleId?: string;
}
