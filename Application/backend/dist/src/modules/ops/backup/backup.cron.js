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
var BackupCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const backup_service_1 = require("./backup.service");
let BackupCron = BackupCron_1 = class BackupCron {
    constructor(backup) {
        this.backup = backup;
        this.logger = new common_1.Logger(BackupCron_1.name);
    }
    async nightlyBackupAll() {
        this.logger.log('[CRON] Nightly backup started');
        if (!this.backup.isPgDumpAvailable()) {
            this.logger.warn('[CRON] pg_dump not available — skipping nightly backup');
            return;
        }
        try {
            const results = await this.backup.backupAllSchemas('cron');
            const succeeded = results.filter((r) => r.status === 'SUCCESS').length;
            const failed = results.filter((r) => r.status === 'FAILED').length;
            this.logger.log(`[CRON] Nightly backup done — success=${succeeded} failed=${failed}`);
            if (failed > 0) {
                const failures = results
                    .filter((r) => r.status === 'FAILED')
                    .map((r) => `${r.schemaName}: ${r.errorMessage}`)
                    .join('; ');
                this.logger.error(`[CRON] Backup failures: ${failures}`);
            }
        }
        catch (err) {
            this.logger.error(`[CRON] Nightly backup crashed: ${err.message}`);
        }
    }
    async weeklyRetentionCleanup() {
        this.logger.log('[CRON] Weekly backup retention cleanup started');
        try {
            const result = await this.backup.cleanupExpiredBackups();
            this.logger.log(`[CRON] Retention cleanup done — deleted=${result.deleted}`);
        }
        catch (err) {
            this.logger.error(`[CRON] Retention cleanup failed: ${err.message}`);
        }
    }
};
exports.BackupCron = BackupCron;
__decorate([
    (0, schedule_1.Cron)('0 1 * * *', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupCron.prototype, "nightlyBackupAll", null);
__decorate([
    (0, schedule_1.Cron)('0 2 * * 0', { timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BackupCron.prototype, "weeklyRetentionCleanup", null);
exports.BackupCron = BackupCron = BackupCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [backup_service_1.BackupService])
], BackupCron);
//# sourceMappingURL=backup.cron.js.map