import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../../common/guards/jwt-auth.guard';
import { RequirePermissions } from '../../../../core/permissions/decorators/require-permissions.decorator';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { ApiResponse } from '../../../../common/utils/api-response';
import { BackupValidationService } from '../infrastructure/services/backup-validation.service';
import {
  BACKUP_RECORD_REPOSITORY,
  IBackupRecordRepository,
} from '../infrastructure/repositories/backup-record.repository';
import { Inject, Logger } from '@nestjs/common';
import { DbOperationsService } from '../../test-environment/infrastructure/db-operations.service';

@Controller('ops/backup')
@UseGuards(JwtAuthGuard)
@RequirePermissions('ops:manage')
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(
    private readonly backupValidation: BackupValidationService,
    private readonly dbOps: DbOperationsService,
    @Inject(BACKUP_RECORD_REPOSITORY)
    private readonly repo: IBackupRecordRepository,
  ) {}

  /** GET /ops/backup — List backup records for tenant */
  @Get()
  async list(@CurrentUser('tenantId') tenantId: string) {
    const data = await this.repo.findByTenantId(tenantId, 20);
    return ApiResponse.success(data);
  }

  /** POST /ops/backup — Register a new backup record */
  @Post()
  async create(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: {
      dbName: string;
      backupUrl: string;
      checksum: string;
      sizeBytes: number;
      tableCount?: number;
      rowCount?: number;
      expiresAt?: string;
    },
  ) {
    const record = await this.repo.create({
      tenantId,
      dbName: body.dbName,
      backupUrl: body.backupUrl,
      checksum: body.checksum,
      sizeBytes: BigInt(body.sizeBytes),
      tableCount: body.tableCount,
      rowCount: body.rowCount !== undefined ? BigInt(body.rowCount) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      createdById: userId,
    });
    return ApiResponse.success(record, 'Backup record created');
  }

  /** POST /ops/backup/validate/:id — Validate a backup (checksum + size check) */
  @Post('validate/:id')
  async validate(@Param('id', ParseUUIDPipe) id: string) {
    const result = await this.backupValidation.validateBackup(id);
    if (!result.valid) {
      return ApiResponse.error(result.reason ?? 'Validation failed');
    }
    return ApiResponse.success({ valid: true }, 'Backup validated successfully');
  }

  /**
   * POST /ops/backup/create — Execute pg_dump to create a backup of the specified database.
   * Only available when pg_dump is installed. Records the backup in DatabaseBackupRecord.
   */
  @Post('create')
  async createFromDump(
    @CurrentUser('tenantId') tenantId: string,
    @CurrentUser('id') userId: string,
    @Body() body: { dbUrl: string; expiresInHours?: number },
  ) {
    if (!this.dbOps.isPgDumpAvailable()) {
      return ApiResponse.error('pg_dump is not available on this server. Register backup records manually via POST /ops/backup.');
    }

    const { filePath, sizeBytes, checksum, tableCount } = await this.dbOps.createBackup(body.dbUrl);
    const src = this.dbOps.parseDbUrl(body.dbUrl);
    const expiresAt = body.expiresInHours
      ? new Date(Date.now() + body.expiresInHours * 3_600_000)
      : undefined;

    const record = await this.repo.create({
      tenantId,
      dbName: src.database,
      backupUrl: `file://${filePath}`,
      checksum,
      sizeBytes: BigInt(sizeBytes),
      tableCount,
      expiresAt,
      createdById: userId,
    });

    this.logger.log(`Backup created & recorded: ${record.id} for db=${src.database}`);
    return ApiResponse.success({ ...record, filePath }, 'Backup created successfully');
  }

  /** POST /ops/backup/check — Check if tenant has valid backup (used before live DB tests) */
  @Post('check')
  async check(@CurrentUser('tenantId') tenantId: string) {
    const backup = await this.repo.findLatestValidated(tenantId);
    if (!backup) {
      return ApiResponse.success({
        hasValidBackup: false,
        message: 'No validated backup found. Please backup your database before running live DB tests.',
      });
    }
    return ApiResponse.success({
      hasValidBackup: true,
      backupId: backup.id,
      createdAt: backup.createdAt,
      dbName: backup.dbName,
    });
  }
}
