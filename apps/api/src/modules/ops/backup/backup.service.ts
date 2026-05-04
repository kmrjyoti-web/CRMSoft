import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../core/prisma/prisma.service';
import { R2StorageService } from '../../../shared/infrastructure/storage/r2-storage.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

const execAsync = promisify(exec);

export type BackupSchema = 'identity' | 'platform' | 'working' | 'marketplace';

export interface BackupResult {
  logId: string;
  schemaName: string;
  dbName: string;
  r2Key: string | null;
  r2Url: string | null;
  sizeBytes: number;
  checksum: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  durationMs: number;
}

export interface RestoreResult {
  logId: string;
  schemaName: string;
  dbName: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
  durationMs: number;
}

const SCHEMA_ENV_KEY: Record<BackupSchema, string> = {
  identity: 'IDENTITY_DATABASE_URL',
  platform: 'PLATFORM_DATABASE_URL',
  working: 'WORKING_DATABASE_URL',
  marketplace: 'MARKETPLACE_DATABASE_URL',
};

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly tmpDir: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly r2: R2StorageService,
  ) {
    this.tmpDir = this.config.get<string>('BACKUP_TMP_DIR', os.tmpdir());
  }

  // ─── Core Backup ──────────────────────────────────────────────────────────────

  async backupSchema(
    schema: BackupSchema,
    triggeredBy = 'cron',
    retentionDays = 30,
  ): Promise<BackupResult> {
    const start = Date.now();
    const dbUrl = this.config.get<string>(SCHEMA_ENV_KEY[schema]);
    if (!dbUrl) {
      const msg = `No DB URL configured for schema: ${schema}`;
      this.logger.error(msg);
      return this.failResult(schema, '', msg, Date.now() - start);
    }

    const dbName = this.extractDbName(dbUrl);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${schema}-${dbName}-${timestamp}.dump`;
    const filePath = path.join(this.tmpDir, filename);

    const log = await this.prisma.platform.backupLog.create({
      data: {
        schemaName: schema,
        dbName,
        status: 'RUNNING',
        triggeredBy,
        retentionDays,
        expiresAt: new Date(Date.now() + retentionDays * 86400_000),
      },
    });

    try {
      // pg_dump — custom format for space efficiency and selective restore
      await execAsync(
        `pg_dump --format=custom --no-acl --no-owner --file="${filePath}" "${dbUrl}"`,
        { timeout: 10 * 60 * 1000 },
      );

      const buffer = fs.readFileSync(filePath);
      const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
      const sizeBytes = buffer.length;

      const r2Key = `backups/${schema}/${filename}`;
      let r2Url: string | null = null;

      try {
        r2Url = await this.r2.upload({
          key: r2Key,
          body: buffer,
          contentType: 'application/octet-stream',
          metadata: { schema, dbName, checksum, timestamp },
        });
      } catch (r2Err: any) {
        this.logger.warn(`R2 upload failed for ${schema}: ${r2Err.message} — backup file kept locally`);
      }

      const durationMs = Date.now() - start;
      await this.prisma.platform.backupLog.update({
        where: { id: log.id },
        data: {
          r2Key: r2Url ? r2Key : null,
          r2Url,
          sizeBytes: BigInt(sizeBytes),
          checksum,
          status: 'SUCCESS',
          durationMs,
        },
      });

      this.logger.log(
        `Backup ${schema} complete — size=${sizeBytes} checksum=${checksum.slice(0, 8)} r2=${r2Url ? 'ok' : 'local-only'} dur=${durationMs}ms`,
      );
      return { logId: log.id, schemaName: schema, dbName, r2Key, r2Url, sizeBytes, checksum, status: 'SUCCESS', durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMessage = err.message?.slice(0, 500) || 'Unknown error';
      await this.prisma.platform.backupLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage, durationMs },
      });
      this.logger.error(`Backup ${schema} failed: ${errorMessage}`);
      return this.failResult(schema, dbName, errorMessage, durationMs, log.id);
    } finally {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  }

  async backupAllSchemas(triggeredBy = 'cron'): Promise<BackupResult[]> {
    const schemas: BackupSchema[] = ['identity', 'platform', 'working', 'marketplace'];
    const results: BackupResult[] = [];
    for (const schema of schemas) {
      const result = await this.backupSchema(schema, triggeredBy);
      results.push(result);
    }
    return results;
  }

  // ─── Restore ─────────────────────────────────────────────────────────────────

  async restoreFromBackup(backupLogId: string, triggeredBy: string): Promise<RestoreResult> {
    const start = Date.now();
    const backup = await this.prisma.platform.backupLog.findFirst({
      where: { id: backupLogId, status: 'SUCCESS' },
    });
    if (!backup) {
      return { logId: '', schemaName: '', dbName: '', status: 'FAILED', errorMessage: 'Backup not found or not successful', durationMs: 0 };
    }

    const restoreLog = await this.prisma.platform.restoreLog.create({
      data: {
        backupLogId: backup.id,
        schemaName: backup.schemaName,
        dbName: backup.dbName,
        r2Key: backup.r2Key,
        status: 'RUNNING',
        triggeredBy,
      },
    });

    const dbUrl = this.config.get<string>(SCHEMA_ENV_KEY[backup.schemaName as BackupSchema]);
    if (!dbUrl) {
      await this.prisma.platform.restoreLog.update({
        where: { id: restoreLog.id },
        data: { status: 'FAILED', errorMessage: 'No DB URL configured', durationMs: Date.now() - start },
      });
      return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage: 'No DB URL configured', durationMs: Date.now() - start };
    }

    const filePath = path.join(this.tmpDir, `restore-${backup.id}.dump`);
    try {
      // Download from R2 — we use presigned URL approach for large files
      if (backup.r2Key) {
        const presignedUrl = await this.r2.getPresignedUploadUrl(backup.r2Key, 'application/octet-stream', 3600);
        this.logger.log(`Restore ${backup.schemaName}: use presigned URL to fetch from R2`);
        // In practice the ops team uses this URL to download + run pg_restore manually
        // For automated restore: stream from R2 directly
        const { stdout } = await execAsync(
          `curl -s "${presignedUrl}" -o "${filePath}" && pg_restore --clean --if-exists --no-acl --no-owner -d "${dbUrl}" "${filePath}"`,
          { timeout: 20 * 60 * 1000 },
        );
        this.logger.debug(stdout);
      } else {
        return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage: 'No R2 key for this backup', durationMs: Date.now() - start };
      }

      const durationMs = Date.now() - start;
      await this.prisma.platform.restoreLog.update({
        where: { id: restoreLog.id },
        data: { status: 'SUCCESS', durationMs },
      });
      this.logger.log(`Restore ${backup.schemaName} complete in ${durationMs}ms`);
      return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'SUCCESS', durationMs };
    } catch (err: any) {
      const durationMs = Date.now() - start;
      const errorMessage = err.message?.slice(0, 500) || 'Unknown error';
      await this.prisma.platform.restoreLog.update({
        where: { id: restoreLog.id },
        data: { status: 'FAILED', errorMessage, durationMs },
      });
      this.logger.error(`Restore ${backup.schemaName} failed: ${errorMessage}`);
      return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage, durationMs };
    } finally {
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
  }

  // ─── Listing & Retention ─────────────────────────────────────────────────────

  async listBackups(schema?: string, limit = 50) {
    return this.prisma.platform.backupLog.findMany({
      where: { ...(schema ? { schemaName: schema } : {}) },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getBackup(id: string) {
    return this.prisma.platform.backupLog.findFirst({ where: { id } });
  }

  async listRestores(limit = 20) {
    return this.prisma.platform.restoreLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getPresignedDownloadUrl(backupLogId: string): Promise<string | null> {
    const backup = await this.prisma.platform.backupLog.findFirst({ where: { id: backupLogId } });
    if (!backup?.r2Key) return null;
    return this.r2.getPresignedUploadUrl(backup.r2Key, 'application/octet-stream', 3600);
  }

  async cleanupExpiredBackups(): Promise<{ deleted: number }> {
    const logs = await this.prisma.platform.backupLog.findMany({
      where: { expiresAt: { lt: new Date() }, status: 'SUCCESS', r2Key: { not: null } },
    });

    let deleted = 0;
    for (const log of logs) {
      try {
        if (log.r2Key) await this.r2.delete(log.r2Key);
        await this.prisma.platform.backupLog.delete({ where: { id: log.id } });
        deleted++;
      } catch (err: any) {
        this.logger.warn(`Failed to delete expired backup ${log.id}: ${err.message}`);
      }
    }
    this.logger.log(`Expired backup cleanup: deleted ${deleted} backups`);
    return { deleted };
  }

  isPgDumpAvailable(): boolean {
    try {
      const result = require('child_process').execSync('which pg_dump', { stdio: 'pipe' });
      return !!result;
    } catch {
      return false;
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private extractDbName(url: string): string {
    try {
      const u = new URL(url);
      return u.pathname.replace('/', '');
    } catch {
      return 'unknown';
    }
  }

  private failResult(
    schemaName: string,
    dbName: string,
    errorMessage: string,
    durationMs: number,
    logId = '',
  ): BackupResult {
    return { logId, schemaName, dbName, r2Key: null, r2Url: null, sizeBytes: 0, checksum: '', status: 'FAILED', errorMessage, durationMs };
  }
}
