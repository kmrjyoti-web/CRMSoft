import { IsOptional, IsString, IsInt, Min, Max, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class JobQueryDto {
  @IsOptional() @IsString()
  status?: string;

  @IsOptional() @IsString()
  moduleName?: string;

  @IsOptional() @IsString()
  search?: string;
}

export class RunHistoryQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 20;

  @IsOptional() @IsEnum(['SUCCESS', 'FAILED', 'TIMEOUT', 'SKIPPED', 'RUNNING'])
  status?: string;

  @IsOptional() @IsString()
  triggeredBy?: string;
}
