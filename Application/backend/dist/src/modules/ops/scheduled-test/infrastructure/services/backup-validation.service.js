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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var BackupValidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackupValidationService = void 0;
const common_1 = require("@nestjs/common");
const https = require("https");
const http = require("http");
const crypto = require("crypto");
const backup_record_repository_1 = require("../repositories/backup-record.repository");
let BackupValidationService = BackupValidationService_1 = class BackupValidationService {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(BackupValidationService_1.name);
    }
    async computeChecksum(backupUrl) {
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
    async validateBackup(backupRecordId) {
        const record = await this.repo.findById(backupRecordId);
        if (!record)
            return { valid: false, reason: 'Backup record not found' };
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
        }
        catch (err) {
            this.logger.error(`Backup validation failed for ${backupRecordId}: ${err.message}`);
            return { valid: false, reason: err.message };
        }
    }
    async requireValidatedBackup(tenantId) {
        const backup = await this.repo.findLatestValidated(tenantId);
        if (!backup) {
            throw new common_1.ConflictException('Live DB test requires a validated backup. Please backup your database first, then validate the backup before proceeding.');
        }
        const ageMs = Date.now() - new Date(backup.createdAt).getTime();
        const maxAgeMs = 24 * 60 * 60 * 1000;
        if (ageMs > maxAgeMs) {
            throw new common_1.ConflictException('Your most recent validated backup is older than 24 hours. Please create a fresh backup before running tests on the live database.');
        }
    }
    async findBestBackupForTesting(tenantId) {
        return this.repo.findLatestValidated(tenantId);
    }
};
exports.BackupValidationService = BackupValidationService;
exports.BackupValidationService = BackupValidationService = BackupValidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(backup_record_repository_1.BACKUP_RECORD_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], BackupValidationService);
//# sourceMappingURL=backup-validation.service.js.map