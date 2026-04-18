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
var CleanupTestEnvHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CleanupTestEnvHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cleanup_test_env_command_1 = require("./cleanup-test-env.command");
const test_env_repository_1 = require("../../../infrastructure/repositories/test-env.repository");
const db_operations_service_1 = require("../../../infrastructure/db-operations.service");
let CleanupTestEnvHandler = CleanupTestEnvHandler_1 = class CleanupTestEnvHandler {
    constructor(repo, dbOps) {
        this.repo = repo;
        this.dbOps = dbOps;
        this.logger = new common_1.Logger(CleanupTestEnvHandler_1.name);
    }
    async execute(cmd) {
        const testEnv = await this.repo.findById(cmd.testEnvId);
        if (!testEnv)
            throw new common_1.NotFoundException(`TestEnvironment ${cmd.testEnvId} not found`);
        if (testEnv.status === 'CLEANED' || testEnv.status === 'CLEANING') {
            return { cleaned: true };
        }
        await this.repo.update(testEnv.id, {
            status: 'CLEANING',
            statusMessage: 'Dropping test database...',
        });
        try {
            await this.dbOps.dropDatabase(testEnv.testDbName);
            await this.repo.update(testEnv.id, {
                status: 'CLEANED',
                statusMessage: 'Test environment cleaned up',
                cleanedAt: new Date(),
            });
            this.logger.log(`TestEnvironment cleaned: ${testEnv.testDbName}`);
            return { cleaned: true };
        }
        catch (err) {
            await this.repo.update(testEnv.id, {
                status: 'FAILED',
                statusMessage: `Cleanup failed: ${err.message}`,
                errorMessage: err.message,
            });
            throw err;
        }
    }
};
exports.CleanupTestEnvHandler = CleanupTestEnvHandler;
exports.CleanupTestEnvHandler = CleanupTestEnvHandler = CleanupTestEnvHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cleanup_test_env_command_1.CleanupTestEnvCommand),
    __param(0, (0, common_1.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __metadata("design:paramtypes", [Object, db_operations_service_1.DbOperationsService])
], CleanupTestEnvHandler);
//# sourceMappingURL=cleanup-test-env.handler.js.map