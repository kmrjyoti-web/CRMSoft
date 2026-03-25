import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger, Inject } from '@nestjs/common';
import { Job } from 'bull';
import { TEST_ENV_QUEUE } from '../commands/create-test-env/create-test-env.handler';
import { DbOperationsService } from '../../infrastructure/db-operations.service';
import {
  TEST_ENV_REPOSITORY,
  ITestEnvRepository,
} from '../../infrastructure/repositories/test-env.repository';
import type { TestEnvStatus } from '@prisma/platform-client';

export interface CreateTestEnvJobData {
  testEnvId: string;
}

@Processor(TEST_ENV_QUEUE)
@Injectable()
export class TestEnvProcessor {
  private readonly logger = new Logger(TestEnvProcessor.name);

  constructor(
    private readonly dbOps: DbOperationsService,
    @Inject(TEST_ENV_REPOSITORY)
    private readonly repo: ITestEnvRepository,
  ) {}

  @Process('CREATE_TEST_ENV')
  async handleCreate(job: Job<CreateTestEnvJobData>): Promise<void> {
    const { testEnvId } = job.data;

    const testEnv = await this.repo.findById(testEnvId);
    if (!testEnv) throw new Error(`TestEnvironment not found: ${testEnvId}`);

    this.logger.log(`Processing ${testEnv.sourceType} for env: ${testEnv.name}`);

    try {
      await this.updateStatus(testEnvId, 'CREATING', 'Creating database…', 10);

      const testDbUrl = this.dbOps.buildTestDbUrl(testEnv.testDbName);

      switch (testEnv.sourceType) {
        case 'SEED_DATA':
          await this.handleSeedData(testEnvId, testEnv.testDbName, testDbUrl);
          break;
        case 'LIVE_CLONE':
          await this.handleLiveClone(testEnvId, testEnv.testDbName, testEnv.sourceDbUrl ?? '');
          break;
        case 'BACKUP_RESTORE':
          await this.handleBackupRestore(testEnvId, testEnv.testDbName, testEnv.backupId ?? '');
          break;
        default:
          throw new Error(`Unknown sourceType: ${testEnv.sourceType}`);
      }

      const dbSizeBytes = await this.dbOps.getDatabaseSize(testEnv.testDbName);
      const expiresAt = new Date(Date.now() + testEnv.ttlHours * 60 * 60 * 1000);

      await this.repo.update(testEnvId, {
        status: 'READY',
        statusMessage: 'Test environment is ready',
        progressPercent: 100,
        testDbUrl,
        dbSizeBytes: BigInt(dbSizeBytes),
        expiresAt,
        completedAt: new Date(),
      });

      this.logger.log(`TestEnvironment READY: ${testEnv.name} (expires: ${expiresAt.toISOString()})`);
    } catch (err: any) {
      this.logger.error(`TestEnvironment FAILED: ${testEnv.name} — ${err.message}`);
      await this.repo.update(testEnvId, {
        status: 'FAILED',
        statusMessage: `Failed: ${err.message}`,
        errorMessage: err.message,
        errorStack: err.stack,
      });
      throw err;
    }
  }

  // ── Source handlers ────────────────────────────────────────────────────────

  private async handleSeedData(testEnvId: string, dbName: string, dbUrl: string): Promise<void> {
    // 1. Create database
    await this.dbOps.createDatabase(dbName);
    await this.updateStatus(testEnvId, 'CREATING', 'Running schema migrations…', 30);

    // 2. Run all 4 schema migrations
    const tablesCreated = await this.dbOps.runAllMigrations(dbUrl);
    await this.updateStatus(testEnvId, 'SEEDING', 'Loading seed data…', 60);

    // 3. Run seed scripts
    const seedRecords = await this.dbOps.runSeedScripts(dbUrl);

    await this.repo.update(testEnvId, {
      tablesCreated,
      seedRecords,
      progressPercent: 90,
    });

    this.logger.log(`SEED_DATA: migrations=${tablesCreated} schemas, records≈${seedRecords}`);
  }

  private async handleLiveClone(
    testEnvId: string,
    dbName: string,
    sourceUrl: string,
  ): Promise<void> {
    if (!sourceUrl) {
      throw new Error('sourceDbUrl is required for LIVE_CLONE');
    }
    await this.updateStatus(testEnvId, 'CREATING', 'Cloning live database (pg_dump)…', 20);
    await this.dbOps.cloneDatabase(sourceUrl, dbName);
    await this.updateStatus(testEnvId, 'CREATING', 'Clone complete — verifying…', 90);
  }

  private async handleBackupRestore(
    testEnvId: string,
    dbName: string,
    backupId: string,
  ): Promise<void> {
    await this.updateStatus(testEnvId, 'CREATING', 'Locating backup file…', 20);
    // Backup file resolution will be implemented when OPS-5 (backup manager) is built.
    // For now resolve using a convention: backups/{backupId}.dump
    const backupPath = `backups/${backupId}.dump`;
    await this.updateStatus(testEnvId, 'CREATING', 'Restoring from backup (pg_restore)…', 40);
    await this.dbOps.restoreFromBackup(backupPath, dbName);
    await this.updateStatus(testEnvId, 'CREATING', 'Restore complete — verifying…', 90);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async updateStatus(
    id: string,
    status: TestEnvStatus,
    message: string,
    progress: number,
  ): Promise<void> {
    await this.repo.update(id, {
      status,
      statusMessage: message,
      progressPercent: progress,
    });
  }
}
