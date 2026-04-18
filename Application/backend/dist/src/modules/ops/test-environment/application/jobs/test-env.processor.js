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
var TestEnvProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEnvProcessor = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const create_test_env_handler_1 = require("../commands/create-test-env/create-test-env.handler");
const db_operations_service_1 = require("../../infrastructure/db-operations.service");
const test_env_repository_1 = require("../../infrastructure/repositories/test-env.repository");
let TestEnvProcessor = TestEnvProcessor_1 = class TestEnvProcessor {
    constructor(dbOps, repo) {
        this.dbOps = dbOps;
        this.repo = repo;
        this.logger = new common_1.Logger(TestEnvProcessor_1.name);
    }
    async handleCreate(job) {
        const { testEnvId } = job.data;
        const testEnv = await this.repo.findById(testEnvId);
        if (!testEnv)
            throw new Error(`TestEnvironment not found: ${testEnvId}`);
        this.logger.log(`Processing ${testEnv.sourceType} for env: ${testEnv.name}`);
        try {
            await this.updateStatus(testEnvId, 'CREATING', 'Creating database�', 10);
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
        }
        catch (err) {
            this.logger.error(`TestEnvironment FAILED: ${testEnv.name} � ${err.message}`);
            await this.repo.update(testEnvId, {
                status: 'FAILED',
                statusMessage: `Failed: ${err.message}`,
                errorMessage: err.message,
                errorStack: err.stack,
            });
            throw err;
        }
    }
    async handleSeedData(testEnvId, dbName, dbUrl) {
        await this.dbOps.createDatabase(dbName);
        await this.updateStatus(testEnvId, 'CREATING', 'Running schema migrations�', 30);
        const tablesCreated = await this.dbOps.runAllMigrations(dbUrl);
        await this.updateStatus(testEnvId, 'SEEDING', 'Loading seed data�', 60);
        const seedRecords = await this.dbOps.runSeedScripts(dbUrl);
        await this.repo.update(testEnvId, {
            tablesCreated,
            seedRecords,
            progressPercent: 90,
        });
        this.logger.log(`SEED_DATA: migrations=${tablesCreated} schemas, records�${seedRecords}`);
    }
    async handleLiveClone(testEnvId, dbName, sourceUrl) {
        if (!sourceUrl) {
            throw new Error('sourceDbUrl is required for LIVE_CLONE');
        }
        await this.updateStatus(testEnvId, 'CREATING', 'Cloning live database (pg_dump)�', 20);
        await this.dbOps.cloneDatabase(sourceUrl, dbName);
        await this.updateStatus(testEnvId, 'CREATING', 'Clone complete � verifying�', 90);
    }
    async handleBackupRestore(testEnvId, dbName, backupId) {
        await this.updateStatus(testEnvId, 'CREATING', 'Locating backup file�', 20);
        const backupPath = `backups/${backupId}.dump`;
        await this.updateStatus(testEnvId, 'CREATING', 'Restoring from backup (pg_restore)�', 40);
        await this.dbOps.restoreFromBackup(backupPath, dbName);
        await this.updateStatus(testEnvId, 'CREATING', 'Restore complete � verifying�', 90);
    }
    async updateStatus(id, status, message, progress) {
        await this.repo.update(id, {
            status,
            statusMessage: message,
            progressPercent: progress,
        });
    }
};
exports.TestEnvProcessor = TestEnvProcessor;
__decorate([
    (0, bull_1.Process)('CREATE_TEST_ENV'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestEnvProcessor.prototype, "handleCreate", null);
exports.TestEnvProcessor = TestEnvProcessor = TestEnvProcessor_1 = __decorate([
    (0, bull_1.Processor)(create_test_env_handler_1.TEST_ENV_QUEUE),
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __metadata("design:paramtypes", [db_operations_service_1.DbOperationsService, Object])
], TestEnvProcessor);
//# sourceMappingURL=test-env.processor.js.map