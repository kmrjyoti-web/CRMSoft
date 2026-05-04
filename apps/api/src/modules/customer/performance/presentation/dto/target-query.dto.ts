import { IsOptional, IsNumberString, IsString, IsEnum, IsBooleanString } from 'class-validator';
import { TargetMetric, TargetPeriod } from './create-target.dto';

export class TargetQueryDto {
  @IsOptional() @IsNumberString()
  page?: number = 1;

  @IsOptional() @IsNumberString()
  limit?: number = 20;

  @IsOptional() @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional() @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsEnum(TargetPeriod)
  period?: TargetPeriod;

  @IsOptional() @IsEnum(TargetMetric)
  metric?: TargetMetric;

  @IsOptional() @IsBooleanString()
  isActive?: boolean;
}
