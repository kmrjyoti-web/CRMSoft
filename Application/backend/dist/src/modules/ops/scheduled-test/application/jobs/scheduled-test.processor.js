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
var ScheduledTestProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTestProcessor = exports.SCHEDULED_TEST_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const cron_parser_1 = require("cron-parser");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const platform_client_1 = require("@prisma/platform-client");
const test_orchestrator_service_1 = require("../../../test-runner/application/services/test-orchestrator.service");
const scheduled_test_repository_1 = require("../../infrastructure/repositories/scheduled-test.repository");
const scheduled_test_run_repository_1 = require("../../infrastructure/repositories/scheduled-test-run.repository");
const backup_validation_service_1 = require("../../infrastructure/services/backup-validation.service");
exports.SCHEDULED_TEST_QUEUE = 'SCHEDULED_TEST_QUEUE';
let ScheduledTestProcessor = ScheduledTestProcessor_1 = class ScheduledTestProcessor {
    constructor(testRepo, runRepo, prisma, orchestrator, backupValidation) {
        this.testRepo = testRepo;
        this.runRepo = runRepo;
        this.prisma = prisma;
        this.orchestrator = orchestrator;
        this.backupValidation = backupValidation;
        this.logger = new common_1.Logger(ScheduledTestProcessor_1.name);
    }
    async executeScheduledTest(job) {
        const { scheduledTestId, scheduledTestRunId, triggeredBy } = job.data;
        this.logger.log(`Executing scheduled test: ${scheduledTestId}, run: ${scheduledTestRunId}`);
        const test = await this.testRepo.findById(scheduledTestId);
        if (!test) {
            this.logger.error(`ScheduledTest not found: ${scheduledTestId}`);
            return;
        }
        await this.runRepo.update(scheduledTestRunId, { status: 'RUNNING' });
        try {
            const backup = await this.backupValidation.findBestBackupForTesting(test.tenantId);
            if (backup) {
                await this.runRepo.update(scheduledTestRunId, { backupRecordId: backup.id });
            }
            const testTypes = test.testTypes.filter(t => Object.values(platform_client_1.TestType).includes(t));
            const testRun = await this.prisma.platform.testRun.create({
                data: {
                    tenantId: test.tenantId,
                    runType: 'SCHEDULED',
                    testTypes: testTypes,
                    targetModules: test.targetModules,
                    createdById: triggeredBy ?? 'system',
                    status: 'RUNNING',
                    startedAt: new Date(),
                },
            });
            await this.runRepo.update(scheduledTestRunId, { testRunId: testRun.id });
            const config = {
                tenantId: test.tenantId,
                testEnvId: undefined,
                targetModules: test.targetModules,
            };
            await this.orchestrator.runAll(testRun.id, testTypes, config);
            const completed = await this.prisma.platform.testRun.findUnique({ where: { id: testRun.id } });
            const finalStatus = completed?.status ?? 'COMPLETED';
            await this.runRepo.update(scheduledTestRunId, {
                status: finalStatus,
                completedAt: new Date(),
            });
            await this.testRepo.update(scheduledTestId, {
                lastRunAt: new Date(),
                lastRunStatus: finalStatus,
                nextRunAt: this.computeNextRun(test.cronExpression),
            });
            this.logger.log(`ScheduledTest completed: ${scheduledTestId}, status=${finalStatus}`);
        }
        catch (err) {
            this.logger.error(`ScheduledTest execution failed: ${scheduledTestId}: ${err.message}`);
            await this.runRepo.update(scheduledTestRunId, {
                status: 'FAILED',
                errorMessage: err.message,
                completedAt: new Date(),
            });
            await this.testRepo.update(scheduledTestId, {
                lastRunAt: new Date(),
                lastRunStatus: 'FAILED',
                nextRunAt: this.computeNextRun(test.cronExpression),
            });
        }
    }
    computeNextRun(cronExpression) {
        try {
            return cron_parser_1.CronExpressionParser.parse(cronExpression).next().toDate();
        }
        catch {
            const d = new Date();
            d.setHours(d.getHours() + 1, 0, 0, 0);
            return d;
        }
    }
};
exports.ScheduledTestProcessor = ScheduledTestProcessor;
__decorate([
    (0, bull_1.Process)('EXECUTE_SCHEDULED_TEST'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduledTestProcessor.prototype, "executeScheduledTest", null);
exports.ScheduledTestProcessor = ScheduledTestProcessor = ScheduledTestProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.SCHEDULED_TEST_QUEUE),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(scheduled_test_run_repository_1.SCHEDULED_TEST_RUN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService,
        test_orchestrator_service_1.TestOrchestratorService,
        backup_validation_service_1.BackupValidationService])
], ScheduledTestProcessor);
//# sourceMappingURL=scheduled-test.processor.js.map