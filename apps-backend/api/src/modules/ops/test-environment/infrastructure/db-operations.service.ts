import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { execSync } from 'child_process';
import { Client as PgClient } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import * as os from 'os';

@Injectable()
export class DbOperationsService {
  private readonly logger = new Logger(DbOperationsService.name);

  constructor(private readonly config: ConfigService) {}

  // -- Database CRUD ----------------------------------------------------------

  /**
   * Create a new PostgreSQL database using the pg client (no CLI required).
   */
  async createDatabase(dbName: string): Promise<void> {
    const adminUrl = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    // Connect to the 'postgres' maintenance database to run CREATE DATABASE
    const maintenanceUrl = this.swapDatabase(adminUrl, 'postgres');
    const client = new PgClient({ connectionString: maintenanceUrl });

    try {
      await client.connect();
      // Sanitize: only allow safe DB names (alphanumeric + underscore)
      if (!/^[a-z0-9_]+$/i.test(dbName)) {
        throw new Error(`Invalid database name: ${dbName}`);
      }
      await client.query(`CREATE DATABASE "${dbName}"`);
      this.logger.log(`Database created: ${dbName}`);
    } catch (err: any) {
      if (err.message?.includes('already exists')) {
        this.logger.warn(`Database already exists: ${dbName}`);
      } else {
        throw new Error(`Failed to create database ${dbName}: ${err.message}`);
      }
    } finally {
      await client.end();
    }
  }

  /**
   * Drop a PostgreSQL database (terminates active connections first).
   */
  async dropDatabase(dbName: string): Promise<void> {
    const adminUrl = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    const maintenanceUrl = this.swapDatabase(adminUrl, 'postgres');
    const client = new PgClient({ connectionString: maintenanceUrl });

    try {
      await client.connect();
      // Terminate all connections to the database
      await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [dbName]);

      await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
      this.logger.log(`Database dropped: ${dbName}`);
    } catch (err: any) {
      throw new Error(`Failed to drop database ${dbName}: ${err.message}`);
    } finally {
      await client.end();
    }
  }

  /**
   * Run Prisma migrations (deploy) against a specific database URL.
   * Uses execSync with DATABASE_URL override � requires Prisma CLI.
   */
  async runMigrations(dbUrl: string, schemaPath: string): Promise<void> {
    const absoluteSchema = path.resolve(process.cwd(), schemaPath);
    try {
      execSync(
        `DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${absoluteSchema}`,
        { timeout: 180_000, cwd: process.cwd(), stdio: 'pipe' },
      );
      this.logger.log(`Migrations applied: ${schemaPath}`);
    } catch (err: any) {
      const stderr = err.stderr?.toString() ?? err.message;
      throw new Error(`Migration failed for ${schemaPath}: ${stderr}`);
    }
  }

  /**
   * Run all 4 schema migrations sequentially against the test DB.
   * Returns number of schemas migrated.
   */
  async runAllMigrations(testDbUrl: string): Promise<number> {
    const schemas = [
      'prisma/identity/v1',
      'prisma/platform/v1',
      'prisma/working/v1',
      'prisma/marketplace/v1',
    ];

    for (const schema of schemas) {
      // Build schema-specific DB URL (each schema has its own env var in prod,
      // but for test DB we point all to the same test database)
      await this.runMigrations(testDbUrl, schema);
    }
    return schemas.length;
  }

  /**
   * Create a pg_dump backup of a database (custom format, compressed).
   * Returns the backup file path, file size in bytes, and SHA-256 checksum.
   * The caller is responsible for moving/uploading the file afterwards.
   */
  async createBackup(
    sourceDbUrl: string,
    outputPath?: string,
  ): Promise<{ filePath: string; sizeBytes: number; checksum: string; tableCount: number }> {
    this.assertPgDumpAvailable();

    const src = this.parseDbUrl(sourceDbUrl);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
    const fileName = `backup_${src.database}_${timestamp}.dump`;
    const filePath = outputPath ?? path.join(os.tmpdir(), fileName);

    try {
      execSync(
        `PGPASSWORD="${src.password}" pg_dump -h ${src.host} -p ${src.port} -U ${src.user} -Fc "${src.database}" -f "${filePath}"`,
        { timeout: 600_000, stdio: 'pipe' },
      );

      const stat = fs.statSync(filePath);
      const sizeBytes = stat.size;

      // Compute SHA-256 checksum
      const fileBuffer = fs.readFileSync(filePath);
      const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');

      // Get rough table count from backup listing
      let tableCount = 0;
      try {
        const listing = execSync(
          `PGPASSWORD="${src.password}" pg_restore --list "${filePath}" 2>/dev/null || true`,
          { encoding: 'utf-8', timeout: 30_000, stdio: 'pipe' },
        );
        tableCount = (listing.match(/TABLE DATA/g) ?? []).length;
      } catch {
        tableCount = 0;
      }

      this.logger.log(`Backup created: ${filePath} (${sizeBytes} bytes, tables=${tableCount})`);
      return { filePath, sizeBytes, checksum, tableCount };
    } catch (err: any) {
      // Clean up partial file
      try { fs.unlinkSync(filePath); } catch {}
      throw new Error(`Backup failed for ${src.database}: ${err.stderr?.toString() ?? err.message}`);
    }
  }

  /**
   * Compute SHA-256 checksum of a local file.
   */
  computeFileChecksum(filePath: string): string {
    const buffer = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Clone a database using pg_dump | pg_restore (requires pg CLI tools).
   * Falls back gracefully with a clear error if CLI tools are not available.
   */
  async cloneDatabase(sourceUrl: string, targetDbName: string): Promise<void> {
    this.assertPgDumpAvailable();

    const src = this.parseDbUrl(sourceUrl);
    const adminUrl = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    const tgt = this.parseDbUrl(adminUrl);

    await this.createDatabase(targetDbName);

    try {
      execSync(
        `PGPASSWORD="${src.password}" pg_dump -h ${src.host} -p ${src.port} -U ${src.user} -Fc "${src.database}" | ` +
        `PGPASSWORD="${tgt.password}" pg_restore -h ${tgt.host} -p ${tgt.port} -U ${tgt.user} -d "${targetDbName}" --no-owner --no-privileges`,
        { timeout: 600_000, stdio: 'pipe' },
      );
      this.logger.log(`Database cloned: ${src.database} ? ${targetDbName}`);
    } catch (err: any) {
      throw new Error(`Clone failed: ${err.stderr?.toString() ?? err.message}`);
    }
  }

  /**
   * Restore a database from a pg_dump backup file.
   */
  async restoreFromBackup(backupFilePath: string, targetDbName: string): Promise<void> {
    this.assertPgDumpAvailable();

    const adminUrl = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    const { host, port, user, password } = this.parseDbUrl(adminUrl);

    await this.createDatabase(targetDbName);

    try {
      execSync(
        `PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${user} -d "${targetDbName}" --no-owner --no-privileges "${backupFilePath}"`,
        { timeout: 600_000, stdio: 'pipe' },
      );
      this.logger.log(`Restored backup into: ${targetDbName}`);
    } catch (err: any) {
      throw new Error(`Restore failed: ${err.stderr?.toString() ?? err.message}`);
    }
  }

  /**
   * Get the approximate size of a database in bytes.
   */
  async getDatabaseSize(dbName: string): Promise<number> {
    const adminUrl = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    const client = new PgClient({ connectionString: adminUrl });

    try {
      await client.connect();
      const res = await client.query<{ size: string }>(
        `SELECT pg_database_size($1)::text AS size`,
        [dbName],
      );
      return parseInt(res.rows[0]?.size ?? '0', 10) || 0;
    } catch {
      return 0;
    } finally {
      await client.end();
    }
  }

  /**
   * Run all seed scripts against the test DB using ts-node.
   * Returns total approximate records seeded.
   */
  async runSeedScripts(testDbUrl: string): Promise<number> {
    const seedFiles = [
      'prisma/seeds/account-master.seed.ts',
      'prisma/seeds/customer-menu-categories.seed.ts',
      'prisma/seeds/error-catalog.seed.ts',
      'prisma/seeds/permission-templates.seed.ts',
      'prisma/seeds/report-definitions.seed.ts',
      'prisma/seeds/shortcut-definitions.seed.ts',
    ];

    let totalRecords = 0;
    for (const seedFile of seedFiles) {
      const absolutePath = path.resolve(process.cwd(), seedFile);
      try {
        const output = execSync(
          `DATABASE_URL="${testDbUrl}" PLATFORM_DATABASE_URL="${testDbUrl}" IDENTITY_DATABASE_URL="${testDbUrl}" GLOBAL_WORKING_DATABASE_URL="${testDbUrl}" MARKETPLACE_DATABASE_URL="${testDbUrl}" npx ts-node --project tsconfig.json "${absolutePath}"`,
          { encoding: 'utf-8', timeout: 120_000, cwd: process.cwd(), stdio: 'pipe' },
        );
        this.logger.log(`Seed completed: ${seedFile}`);
        // Try to parse a numeric count from the output
        const match = output.match(/(\d+)\s*(records?|rows?|values?|created|upserted)/i);
        if (match) totalRecords += parseInt(match[1], 10);
        else totalRecords += 10; // conservative estimate
      } catch (err: any) {
        this.logger.warn(`Seed skipped (${seedFile}): ${err.message?.split('\n')[0]}`);
      }
    }
    return totalRecords;
  }

  /**
   * Build a test DB connection URL by swapping the database name
   * in the existing PLATFORM_DATABASE_URL.
   */
  buildTestDbUrl(testDbName: string): string {
    const base = this.config.get<string>('PLATFORM_DATABASE_URL')!;
    return this.swapDatabase(base, testDbName);
  }

  /**
   * Check whether pg_dump is available on the system PATH.
   */
  isPgDumpAvailable(): boolean {
    try {
      execSync('which pg_dump', { stdio: 'pipe', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  // -- Helpers ---------------------------------------------------------------

  /**
   * Swap the database name in a PostgreSQL connection string.
   * postgresql://user:pass@host:port/OLD_DB ? postgresql://user:pass@host:port/NEW_DB
   */
  private swapDatabase(url: string, newDb: string): string {
    // Handle URLs with query params: postgresql://u:p@h:p/dbname?schema=...
    return url.replace(/\/([^/?]+)(\?.*)?$/, `/${newDb}$2`);
  }

  parseDbUrl(url: string): { host: string; port: string; user: string; password: string; database: string } {
    const match = url.match(/postgresql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/([^?]+)/);
    if (!match) throw new Error(`Cannot parse DB URL (format: postgresql://user:pass@host:port/db): ${url.replace(/:[^@]+@/, ':***@')}`);
    return { user: match[1], password: match[2], host: match[3], port: match[4], database: match[5] };
  }

  private assertPgDumpAvailable(): void {
    if (!this.isPgDumpAvailable()) {
      throw new Error(
        'pg_dump is not installed. Install PostgreSQL client tools (e.g. brew install postgresql) ' +
        'to use LIVE_CLONE or BACKUP_RESTORE. SEED_DATA works without pg_dump.',
      );
    }
  }
}
