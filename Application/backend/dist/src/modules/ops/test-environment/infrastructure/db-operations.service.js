"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DbOperationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DbOperationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const child_process_1 = require("child_process");
const pg_1 = require("pg");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const os = require("os");
let DbOperationsService = DbOperationsService_1 = class DbOperationsService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(DbOperationsService_1.name);
    }
    async createDatabase(dbName) {
        const adminUrl = this.config.get('PLATFORM_DATABASE_URL');
        const maintenanceUrl = this.swapDatabase(adminUrl, 'postgres');
        const client = new pg_1.Client({ connectionString: maintenanceUrl });
        try {
            await client.connect();
            if (!/^[a-z0-9_]+$/i.test(dbName)) {
                throw new Error(`Invalid database name: ${dbName}`);
            }
            await client.query(`CREATE DATABASE "${dbName}"`);
            this.logger.log(`Database created: ${dbName}`);
        }
        catch (err) {
            if (err.message?.includes('already exists')) {
                this.logger.warn(`Database already exists: ${dbName}`);
            }
            else {
                throw new Error(`Failed to create database ${dbName}: ${err.message}`);
            }
        }
        finally {
            await client.end();
        }
    }
    async dropDatabase(dbName) {
        const adminUrl = this.config.get('PLATFORM_DATABASE_URL');
        const maintenanceUrl = this.swapDatabase(adminUrl, 'postgres');
        const client = new pg_1.Client({ connectionString: maintenanceUrl });
        try {
            await client.connect();
            await client.query(`
        SELECT pg_terminate_backend(pid)
        FROM pg_stat_activity
        WHERE datname = $1 AND pid <> pg_backend_pid()
      `, [dbName]);
            await client.query(`DROP DATABASE IF EXISTS "${dbName}"`);
            this.logger.log(`Database dropped: ${dbName}`);
        }
        catch (err) {
            throw new Error(`Failed to drop database ${dbName}: ${err.message}`);
        }
        finally {
            await client.end();
        }
    }
    async runMigrations(dbUrl, schemaPath) {
        const absoluteSchema = path.resolve(process.cwd(), schemaPath);
        try {
            (0, child_process_1.execSync)(`DATABASE_URL="${dbUrl}" npx prisma migrate deploy --schema=${absoluteSchema}`, { timeout: 180_000, cwd: process.cwd(), stdio: 'pipe' });
            this.logger.log(`Migrations applied: ${schemaPath}`);
        }
        catch (err) {
            const stderr = err.stderr?.toString() ?? err.message;
            throw new Error(`Migration failed for ${schemaPath}: ${stderr}`);
        }
    }
    async runAllMigrations(testDbUrl) {
        const schemas = [
            'prisma/identity/v1',
            'prisma/platform/v1',
            'prisma/working/v1',
            'prisma/marketplace/v1',
        ];
        for (const schema of schemas) {
            await this.runMigrations(testDbUrl, schema);
        }
        return schemas.length;
    }
    async createBackup(sourceDbUrl, outputPath) {
        this.assertPgDumpAvailable();
        const src = this.parseDbUrl(sourceDbUrl);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        const fileName = `backup_${src.database}_${timestamp}.dump`;
        const filePath = outputPath ?? path.join(os.tmpdir(), fileName);
        try {
            (0, child_process_1.execSync)(`PGPASSWORD="${src.password}" pg_dump -h ${src.host} -p ${src.port} -U ${src.user} -Fc "${src.database}" -f "${filePath}"`, { timeout: 600_000, stdio: 'pipe' });
            const stat = fs.statSync(filePath);
            const sizeBytes = stat.size;
            const fileBuffer = fs.readFileSync(filePath);
            const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
            let tableCount = 0;
            try {
                const listing = (0, child_process_1.execSync)(`PGPASSWORD="${src.password}" pg_restore --list "${filePath}" 2>/dev/null || true`, { encoding: 'utf-8', timeout: 30_000, stdio: 'pipe' });
                tableCount = (listing.match(/TABLE DATA/g) ?? []).length;
            }
            catch {
                tableCount = 0;
            }
            this.logger.log(`Backup created: ${filePath} (${sizeBytes} bytes, tables=${tableCount})`);
            return { filePath, sizeBytes, checksum, tableCount };
        }
        catch (err) {
            try {
                fs.unlinkSync(filePath);
            }
            catch { }
            throw new Error(`Backup failed for ${src.database}: ${err.stderr?.toString() ?? err.message}`);
        }
    }
    computeFileChecksum(filePath) {
        const buffer = fs.readFileSync(filePath);
        return crypto.createHash('sha256').update(buffer).digest('hex');
    }
    async cloneDatabase(sourceUrl, targetDbName) {
        this.assertPgDumpAvailable();
        const src = this.parseDbUrl(sourceUrl);
        const adminUrl = this.config.get('PLATFORM_DATABASE_URL');
        const tgt = this.parseDbUrl(adminUrl);
        await this.createDatabase(targetDbName);
        try {
            (0, child_process_1.execSync)(`PGPASSWORD="${src.password}" pg_dump -h ${src.host} -p ${src.port} -U ${src.user} -Fc "${src.database}" | ` +
                `PGPASSWORD="${tgt.password}" pg_restore -h ${tgt.host} -p ${tgt.port} -U ${tgt.user} -d "${targetDbName}" --no-owner --no-privileges`, { timeout: 600_000, stdio: 'pipe' });
            this.logger.log(`Database cloned: ${src.database} ? ${targetDbName}`);
        }
        catch (err) {
            throw new Error(`Clone failed: ${err.stderr?.toString() ?? err.message}`);
        }
    }
    async restoreFromBackup(backupFilePath, targetDbName) {
        this.assertPgDumpAvailable();
        const adminUrl = this.config.get('PLATFORM_DATABASE_URL');
        const { host, port, user, password } = this.parseDbUrl(adminUrl);
        await this.createDatabase(targetDbName);
        try {
            (0, child_process_1.execSync)(`PGPASSWORD="${password}" pg_restore -h ${host} -p ${port} -U ${user} -d "${targetDbName}" --no-owner --no-privileges "${backupFilePath}"`, { timeout: 600_000, stdio: 'pipe' });
            this.logger.log(`Restored backup into: ${targetDbName}`);
        }
        catch (err) {
            throw new Error(`Restore failed: ${err.stderr?.toString() ?? err.message}`);
        }
    }
    async getDatabaseSize(dbName) {
        const adminUrl = this.config.get('PLATFORM_DATABASE_URL');
        const client = new pg_1.Client({ connectionString: adminUrl });
        try {
            await client.connect();
            const res = await client.query(`SELECT pg_database_size($1)::text AS size`, [dbName]);
            return parseInt(res.rows[0]?.size ?? '0', 10) || 0;
        }
        catch {
            return 0;
        }
        finally {
            await client.end();
        }
    }
    async runSeedScripts(testDbUrl) {
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
                const output = (0, child_process_1.execSync)(`DATABASE_URL="${testDbUrl}" PLATFORM_DATABASE_URL="${testDbUrl}" IDENTITY_DATABASE_URL="${testDbUrl}" GLOBAL_WORKING_DATABASE_URL="${testDbUrl}" MARKETPLACE_DATABASE_URL="${testDbUrl}" npx ts-node --project tsconfig.json "${absolutePath}"`, { encoding: 'utf-8', timeout: 120_000, cwd: process.cwd(), stdio: 'pipe' });
                this.logger.log(`Seed completed: ${seedFile}`);
                const match = output.match(/(\d+)\s*(records?|rows?|values?|created|upserted)/i);
                if (match)
                    totalRecords += parseInt(match[1], 10);
                else
                    totalRecords += 10;
            }
            catch (err) {
                this.logger.warn(`Seed skipped (${seedFile}): ${err.message?.split('\n')[0]}`);
            }
        }
        return totalRecords;
    }
    buildTestDbUrl(testDbName) {
        const base = this.config.get('PLATFORM_DATABASE_URL');
        return this.swapDatabase(base, testDbName);
    }
    isPgDumpAvailable() {
        try {
            (0, child_process_1.execSync)('which pg_dump', { stdio: 'pipe', timeout: 5000 });
            return true;
        }
        catch {
            return false;
        }
    }
    swapDatabase(url, newDb) {
        return url.replace(/\/([^/?]+)(\?.*)?$/, `/${newDb}$2`);
    }
    parseDbUrl(url) {
        const match = url.match(/postgresql:\/\/([^:]+):([^@]*)@([^:]+):(\d+)\/([^?]+)/);
        if (!match)
            throw new Error(`Cannot parse DB URL (format: postgresql://user:pass@host:port/db): ${url.replace(/:[^@]+@/, ':***@')}`);
        return { user: match[1], password: match[2], host: match[3], port: match[4], database: match[5] };
    }
    assertPgDumpAvailable() {
        if (!this.isPgDumpAvailable()) {
            throw new Error('pg_dump is not installed. Install PostgreSQL client tools (e.g. brew install postgresql) ' +
                'to use LIVE_CLONE or BACKUP_RESTORE. SEED_DATA works without pg_dump.');
        }
    }
};
exports.DbOperationsService = DbOperationsService;
exports.DbOperationsService = DbOperationsService = DbOperationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DbOperationsService);
//# sourceMappingURL=db-operations.service.js.map