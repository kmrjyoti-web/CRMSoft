import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateTestEnvDto {
  @IsIn(['SEED_DATA', 'LIVE_CLONE', 'BACKUP_RESTORE'])
  sourceType: 'SEED_DATA' | 'LIVE_CLONE' | 'BACKUP_RESTORE';

  @IsOptional()
  @IsString()
  displayName?: string;

  /** Required for BACKUP_RESTORE */
  @IsOptional()
  @IsString()
  backupId?: string;

  /** Source DB URL for LIVE_CLONE (defaults to current production URL) */
  @IsOptional()
  @IsUrl({ require_tld: false })
  sourceDbUrl?: string;

  /** Hours until auto-cleanup. Default 24, max 168 (7 days). */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(168)
  ttlHours?: number;
}
