import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsArray, Min, Max } from 'class-validator';

export class UpdateJobDto {
  @IsOptional() @IsString()
  cronExpression?: string;

  @IsOptional() @IsString()
  cronDescription?: string;

  @IsOptional() @IsString()
  timezone?: string;

  @IsOptional() @IsInt() @Min(10) @Max(7200)
  timeoutSeconds?: number;

  @IsOptional() @IsInt() @Min(0) @Max(5)
  maxRetries?: number;

  @IsOptional() @IsInt() @Min(10) @Max(3600)
  retryDelaySeconds?: number;

  @IsOptional() @IsBoolean()
  allowConcurrent?: boolean;

  @IsOptional() @IsBoolean()
  alertOnFailure?: boolean;

  @IsOptional() @IsBoolean()
  alertOnTimeout?: boolean;

  @IsOptional() @IsInt() @Min(1) @Max(10)
  alertAfterConsecutiveFailures?: number;

  @IsOptional() @IsEnum(['EMAIL', 'IN_APP', 'BOTH'])
  alertChannel?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  alertRecipientEmails?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  alertRecipientUserIds?: string[];
}

export class UpdateJobParamsDto {
  @IsOptional()
  jobParams?: Record<string, any>;
}

export class ToggleJobDto {
  @IsEnum(['ACTIVE', 'PAUSED', 'DISABLED'])
  status: string;
}
