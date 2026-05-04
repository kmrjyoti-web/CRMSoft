import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';

export class UpdateRetentionPolicyDto {
  @IsNumber() @Min(1)
  retentionDays: number;

  @IsOptional() @IsBoolean()
  archiveEnabled?: boolean;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class ExportAuditDto {
  @IsString() format: string; // CSV or XLSX

  @IsOptional() @IsString() entityType?: string;
  @IsOptional() @IsString() entityId?: string;
  @IsOptional() @IsString() userId?: string;
  @IsString() dateFrom: string;
  @IsString() dateTo: string;
}

export class CreateAuditLogDto {
  @IsString() entityType: string;
  @IsString() entityId: string;
  @IsString() action: string;
  @IsString() summary: string;
  @IsString() source: string;
  @IsOptional() @IsString() module?: string;
  @IsOptional() @IsString() performedById?: string;
  @IsOptional() @IsString() performedByName?: string;
  @IsOptional() changes?: Array<{ field: string; oldValue?: string; newValue?: string }>;
  @IsOptional() @IsString() correlationId?: string;
  @IsOptional() tags?: string[];
}
