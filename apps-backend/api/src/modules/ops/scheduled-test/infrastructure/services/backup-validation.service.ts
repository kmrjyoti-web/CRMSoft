import { Injectable, Inject, Logger, ConflictException } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import * as crypto from 'crypto';
import {
  BACKUP_RECORD_REPOSITORY,
  IBackupRecordRepository,
} from '../repositories/backup-record.repository';

@Injectable()
export class BackupValidationService {
  private readonly logger = new Logger(BackupValidationService.name);

  constructor(
    @Inject(BACKUP_RECORD_REPOSITORY)
    private readonly repo: IBackupRecordRepository,
  ) {}

  /**
   * Download the backup file from URL and compute its SHA-256 checksum.
   * Returns checksum hex string.
   */
  async computeChecksum(backupUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const protocol = backupUrl.startsWith('https') ? https : http;

      protocol.get(backupUrl, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`Failed to fetch backup: HTTP ${res.statusCode}`));
          return;
        }
        res.on('data', (chunk) => hash.update(chunk));
        res.on('end', () => resolve(hash.digest('hex')));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  /**
   * Validate a backup record: compare stored checksum vs actual file checksum,
   * and verify sizeBytes > 0. Updates the record with isValidated=true on success.
   */
  async validateBackup(backupRecordId: string): Promise<{ valid: boolean; reason?: string }> {
    const record = await this.repo.findById(backupRecordId);
    if (!record) return { valid: false, reason: 'Backup record not found' };

    if (record.sizeBytes === BigInt(0)) {
      return { valid: false, reason: 'Backup file size is 0 bytes' };
    }

    try {
      const actualChecksum = await this.computeChecksum(record.backupUrl);
      if (actualChecksum !== record.checksum) {
        return {
          valid: false,
          reason: `Checksum mismatch: expected ${record.checksum}, got ${actualChecksum}`,
        };
      }

      await this.repo.update(backupRecordId, {
        isValidated: true,
        validatedAt: new Date(),
      });

      this.logger.log(`Backup validated: ${backupRecordId} (${record.dbName})`);
      return { valid: true };
    } catch (err: any) {
      this.logger.error(`Backup validation failed for ${backupRecordId}: ${err.message}`);
      return { valid: false, reason: err.message };
    }
  }

  /**
   * Guard: throw ConflictException if tenant has no validated backup within last 24h.
   * Used before running tests on live database.
   */
  async requireValidatedBackup(tenantId: string): Promise<void> {
    const backup = await this.repo.findLatestValidated(tenantId);

    if (!backup) {
      throw new ConflictException(
        'Live DB test requires a validated backup. Please backup your database first, then validate the backup before proceeding.',
      );
    }

    // Also check it's not older than 24 hours
    const ageMs = Date.now() - new Date(backup.createdAt).getTime();
    const maxAgeMs = 24 * 60 * 60 * 1000;
    if (ageMs > maxAgeMs) {
      throw new ConflictException(
        'Your most recent validated backup is older than 24 hours. Please create a fresh backup before running tests on the live database.',
      );
    }
  }

  /**
   * Find the best available backup for a tenant to use as test DB source.
   * Used by scheduled tests to pick a backup automatically.
   */
  async findBestBackupForTesting(tenantId: string): Promise<any | null> {
    return this.repo.findLatestValidated(tenantId);
  }
}
