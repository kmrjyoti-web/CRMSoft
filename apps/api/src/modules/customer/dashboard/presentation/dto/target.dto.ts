import { IsString, IsNumber, IsOptional, IsDateString } from 'class-validator';

export class CreateTargetDto {
  @IsString()
  metric: string;

  @IsNumber()
  targetValue: number;

  @IsString()
  period: string;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  roleId?: string;

  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  notes?: string;
}

export class UpdateTargetDto {
  @IsOptional() @IsNumber()
  targetValue?: number;

  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  notes?: string;
}
