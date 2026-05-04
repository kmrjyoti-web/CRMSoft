import { IsString, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';

export enum TargetMetric {
  LEADS_CREATED = 'LEADS_CREATED',
  LEADS_WON = 'LEADS_WON',
  REVENUE = 'REVENUE',
  ACTIVITIES = 'ACTIVITIES',
  DEMOS = 'DEMOS',
  CALLS = 'CALLS',
  MEETINGS = 'MEETINGS',
  VISITS = 'VISITS',
  QUOTATIONS_SENT = 'QUOTATIONS_SENT',
  QUOTATIONS_ACCEPTED = 'QUOTATIONS_ACCEPTED',
}

export enum TargetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export class CreateTargetDto {
  @IsOptional() @IsString()
  name?: string;

  @IsEnum(TargetMetric)
  metric: TargetMetric;

  @IsNumber()
  targetValue: number;

  @IsEnum(TargetPeriod)
  period: TargetPeriod;

  @IsDateString()
  periodStart: string;

  @IsDateString()
  periodEnd: string;

  @IsOptional() @IsString()
  userId?: string;

  @IsOptional() @IsString()
  roleId?: string;

  @IsOptional() @IsString()
  notes?: string;
}
