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
var TestEnvCleanupCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestEnvCleanupCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const test_env_repository_1 = require("../../infrastructure/repositories/test-env.repository");
const db_operations_service_1 = require("../../infrastructure/db-operations.service");
let TestEnvCleanupCron = TestEnvCleanupCron_1 = class TestEnvCleanupCron {
    constructor(repo, dbOps) {
        this.repo = repo;
        this.dbOps = dbOps;
        this.logger = new common_1.Logger(TestEnvCleanupCron_1.name);
    }
    async cleanupExpiredEnvironments() {
        const expired = await this.repo.findExpired();
        if (expired.length === 0)
            return;
        this.logger.log(`Auto-cleanup: ${expired.length} expired test environment(s)`);
        for (const env of expired) {
            try {
                await this.repo.update(env.id, {
                    status: 'CLEANING',
                    statusMessage: 'Auto-cleaning (TTL expired)',
                });
                await this.dbOps.dropDatabase(env.testDbName);
                await this.repo.update(env.id, {
                    status: 'CLEANED',
                    statusMessage: 'Auto-cleaned (TTL expired)',
                    cleanedAt: new Date(),
                });
                this.logger.log(`Auto-cleaned: ${env.name} (${env.testDbName})`);
            }
            catch (err) {
                this.logger.error(`Auto-cleanup failed for ${env.name}: ${err.message}`);
                await this.repo.update(env.id, {
                    status: 'FAILED',
                    statusMessage: `Auto-cleanup failed: ${err.message}`,
                    errorMessage: err.message,
                });
            }
        }
    }
};
exports.TestEnvCleanupCron = TestEnvCleanupCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestEnvCleanupCron.prototype, "cleanupExpiredEnvironments", null);
exports.TestEnvCleanupCron = TestEnvCleanupCron = TestEnvCleanupCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __metadata("design:paramtypes", [Object, db_operations_service_1.DbOperationsService])
], TestEnvCleanupCron);
//# sourceMappingURL=test-env-cleanup.cron.js.map