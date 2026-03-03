import { IsOptional, IsString, IsDateString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SearchAuditDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() action?: string;
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsDateString() dateFrom?: string;
  @IsOptional() @IsDateString() dateTo?: string;
  @IsOptional() @IsString() field?: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @Transform(({ value }) => value === 'true') @IsBoolean() sensitive?: boolean;
  @IsOptional() @Type(() => Number) @IsNumber() page?: number;
  @IsOptional() @Type(() => Number) @IsNumber() limit?: number;
}
