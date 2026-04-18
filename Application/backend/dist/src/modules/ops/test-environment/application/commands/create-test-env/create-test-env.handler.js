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
var CreateTestEnvHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestEnvHandler = exports.TEST_ENV_QUEUE = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const create_test_env_command_1 = require("./create-test-env.command");
const test_env_repository_1 = require("../../../infrastructure/repositories/test-env.repository");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const { format } = require('date-fns');
exports.TEST_ENV_QUEUE = 'ops-test-environment';
const MAX_ACTIVE_ENVS = 3;
let CreateTestEnvHandler = CreateTestEnvHandler_1 = class CreateTestEnvHandler {
    constructor(repo, queue, prisma) {
        this.repo = repo;
        this.queue = queue;
        this.prisma = prisma;
        this.logger = new common_1.Logger(CreateTestEnvHandler_1.name);
    }
    async execute(cmd) {
        const { tenantId, userId, sourceType, displayName, backupId, sourceDbUrl, ttlHours } = cmd;
        const activeCount = await this.repo.countActive(tenantId);
        if (activeCount >= MAX_ACTIVE_ENVS) {
            throw new common_1.BadRequestException(`Maximum ${MAX_ACTIVE_ENVS} active test environments allowed per tenant. ` +
                `Please cleanup an existing one before creating a new one.`);
        }
        if (sourceType === 'BACKUP_RESTORE' && !backupId) {
            throw new common_1.BadRequestException('backupId is required for BACKUP_RESTORE source type');
        }
        const companyCode = await this.resolveCompanyCode(tenantId);
        const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
        const dbName = `${companyCode}_${timestamp}`.toLowerCase().replace(/[^a-z0-9_]/g, '_');
        const sourceLabel = { SEED_DATA: 'Seed Test', LIVE_CLONE: 'Live Clone', BACKUP_RESTORE: 'Backup Restore' };
        const dateLabel = format(new Date(), 'MMM d, yyyy HH:mm');
        const resolvedDisplayName = displayName ?? `Test � ${sourceLabel[sourceType]} (${dateLabel})`;
        const testEnv = await this.repo.create({
            tenantId,
            name: dbName,
            displayName: resolvedDisplayName,
            sourceType: sourceType,
            sourceDbUrl,
            backupId,
            testDbName: dbName,
            ttlHours: ttlHours ?? 24,
            createdById: userId,
        });
        await this.queue.add('CREATE_TEST_ENV', { testEnvId: testEnv.id }, {
            attempts: 2,
            backoff: { type: 'fixed', delay: 10_000 },
            removeOnComplete: 50,
            removeOnFail: 50,
        });
        this.logger.log(`TestEnvironment queued: ${dbName} (id=${testEnv.id}, type=${sourceType})`);
        return { id: testEnv.id, name: dbName };
    }
    async resolveCompanyCode(tenantId) {
        try {
            const tenant = await this.prisma.identity.tenant.findUnique({
                where: { id: tenantId },
                select: { name: true, slug: true },
            });
            const raw = tenant?.slug ?? tenant?.name ?? 'test';
            return raw.substring(0, 12).replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        }
        catch {
            return 'test_env';
        }
    }
};
exports.CreateTestEnvHandler = CreateTestEnvHandler;
exports.CreateTestEnvHandler = CreateTestEnvHandler = CreateTestEnvHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_test_env_command_1.CreateTestEnvCommand),
    __param(0, (0, common_1.Inject)(test_env_repository_1.TEST_ENV_REPOSITORY)),
    __param(1, (0, bull_1.InjectQueue)(exports.TEST_ENV_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService])
], CreateTestEnvHandler);
//# sourceMappingURL=create-test-env.handler.js.map