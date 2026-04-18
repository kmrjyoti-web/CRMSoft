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
var BackupService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../../core/prisma/prisma.service");
const r2_storage_service_1 = require("../../../shared/infrastructure/storage/r2-storage.service");
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
const SCHEMA_ENV_KEY = {
    identity: 'IDENTITY_DATABASE_URL',
    platform: 'PLATFORM_DATABASE_URL',
    working: 'WORKING_DATABASE_URL',
    marketplace: 'MARKETPLACE_DATABASE_URL',
};
let BackupService = BackupService_1 = class BackupService {
    constructor(prisma, config, r2) {
        this.prisma = prisma;
        this.config = config;
        this.r2 = r2;
        this.logger = new common_1.Logger(BackupService_1.name);
        this.tmpDir = this.config.get('BACKUP_TMP_DIR', os.tmpdir());
    }
    async backupSchema(schema, triggeredBy = 'cron', retentionDays = 30) {
        const start = Date.now();
        const dbUrl = this.config.get(SCHEMA_ENV_KEY[schema]);
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
            await execAsync(`pg_dump --format=custom --no-acl --no-owner --file="${filePath}" "${dbUrl}"`, { timeout: 10 * 60 * 1000 });
            const buffer = fs.readFileSync(filePath);
            const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
            const sizeBytes = buffer.length;
            const r2Key = `backups/${schema}/${filename}`;
            let r2Url = null;
            try {
                r2Url = await this.r2.upload({
                    key: r2Key,
                    body: buffer,
                    contentType: 'application/octet-stream',
                    metadata: { schema, dbName, checksum, timestamp },
                });
            }
            catch (r2Err) {
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
            this.logger.log(`Backup ${schema} complete — size=${sizeBytes} checksum=${checksum.slice(0, 8)} r2=${r2Url ? 'ok' : 'local-only'} dur=${durationMs}ms`);
            return { logId: log.id, schemaName: schema, dbName, r2Key, r2Url, sizeBytes, checksum, status: 'SUCCESS', durationMs };
        }
        catch (err) {
            const durationMs = Date.now() - start;
            const errorMessage = err.message?.slice(0, 500) || 'Unknown error';
            await this.prisma.platform.backupLog.update({
                where: { id: log.id },
                data: { status: 'FAILED', errorMessage, durationMs },
            });
            this.logger.error(`Backup ${schema} failed: ${errorMessage}`);
            return this.failResult(schema, dbName, errorMessage, durationMs, log.id);
        }
        finally {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }
    async backupAllSchemas(triggeredBy = 'cron') {
        const schemas = ['identity', 'platform', 'working', 'marketplace'];
        const results = [];
        for (const schema of schemas) {
            const result = await this.backupSchema(schema, triggeredBy);
            results.push(result);
        }
        return results;
    }
    async restoreFromBackup(backupLogId, triggeredBy) {
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
        const dbUrl = this.config.get(SCHEMA_ENV_KEY[backup.schemaName]);
        if (!dbUrl) {
            await this.prisma.platform.restoreLog.update({
                where: { id: restoreLog.id },
                data: { status: 'FAILED', errorMessage: 'No DB URL configured', durationMs: Date.now() - start },
            });
            return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage: 'No DB URL configured', durationMs: Date.now() - start };
        }
        const filePath = path.join(this.tmpDir, `restore-${backup.id}.dump`);
        try {
            if (backup.r2Key) {
                const presignedUrl = await this.r2.getPresignedUploadUrl(backup.r2Key, 'application/octet-stream', 3600);
                this.logger.log(`Restore ${backup.schemaName}: use presigned URL to fetch from R2`);
                const { stdout } = await execAsync(`curl -s "${presignedUrl}" -o "${filePath}" && pg_restore --clean --if-exists --no-acl --no-owner -d "${dbUrl}" "${filePath}"`, { timeout: 20 * 60 * 1000 });
                this.logger.debug(stdout);
            }
            else {
                return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage: 'No R2 key for this backup', durationMs: Date.now() - start };
            }
            const durationMs = Date.now() - start;
            await this.prisma.platform.restoreLog.update({
                where: { id: restoreLog.id },
                data: { status: 'SUCCESS', durationMs },
            });
            this.logger.log(`Restore ${backup.schemaName} complete in ${durationMs}ms`);
            return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'SUCCESS', durationMs };
        }
        catch (err) {
            const durationMs = Date.now() - start;
            const errorMessage = err.message?.slice(0, 500) || 'Unknown error';
            await this.prisma.platform.restoreLog.update({
                where: { id: restoreLog.id },
                data: { status: 'FAILED', errorMessage, durationMs },
            });
            this.logger.error(`Restore ${backup.schemaName} failed: ${errorMessage}`);
            return { logId: restoreLog.id, schemaName: backup.schemaName, dbName: backup.dbName, status: 'FAILED', errorMessage, durationMs };
        }
        finally {
            if (fs.existsSync(filePath))
                fs.unlinkSync(filePath);
        }
    }
    async listBackups(schema, limit = 50) {
        return this.prisma.platform.backupLog.findMany({
            where: { ...(schema ? { schemaName: schema } : {}) },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getBackup(id) {
        return this.prisma.platform.backupLog.findFirst({ where: { id } });
    }
    async listRestores(limit = 20) {
        return this.prisma.platform.restoreLog.findMany({
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async getPresignedDownloadUrl(backupLogId) {
        const backup = await this.prisma.platform.backupLog.findFirst({ where: { id: backupLogId } });
        if (!backup?.r2Key)
            return null;
        return this.r2.getPresignedUploadUrl(backup.r2Key, 'application/octet-stream', 3600);
    }
    async cleanupExpiredBackups() {
        const logs = await this.prisma.platform.backupLog.findMany({
            where: { expiresAt: { lt: new Date() }, status: 'SUCCESS', r2Key: { not: null } },
        });
        let deleted = 0;
        for (const log of logs) {
            try {
                if (log.r2Key)
                    await this.r2.delete(log.r2Key);
                await this.prisma.platform.backupLog.delete({ where: { id: log.id } });
                deleted++;
            }
            catch (err) {
                this.logger.warn(`Failed to delete expired backup ${log.id}: ${err.message}`);
            }
        }
        this.logger.log(`Expired backup cleanup: deleted ${deleted} backups`);
        return { deleted };
    }
    isPgDumpAvailable() {
        try {
            const result = require('child_process').execSync('which pg_dump', { stdio: 'pipe' });
            return !!result;
        }
        catch {
            return false;
        }
    }
    extractDbName(url) {
        try {
            const u = new URL(url);
            return u.pathname.replace('/', '');
        }
        catch {
            return 'unknown';
        }
    }
    failResult(schemaName, dbName, errorMessage, durationMs, logId = '') {
        return { logId, schemaName, dbName, r2Key: null, r2Url: null, sizeBytes: 0, checksum: '', status: 'FAILED', errorMessage, durationMs };
    }
};
exports.BackupService = BackupService;
exports.BackupService = BackupService = BackupService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        r2_storage_service_1.R2StorageService])
], BackupService);
//# sourceMappingURL=backup.service.js.map