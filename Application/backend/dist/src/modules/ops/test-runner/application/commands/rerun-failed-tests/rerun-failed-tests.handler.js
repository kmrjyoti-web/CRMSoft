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
var RerunFailedTestsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RerunFailedTestsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const prisma_service_1 = require("../../../../../../core/prisma/prisma.service");
const rerun_failed_tests_command_1 = require("./rerun-failed-tests.command");
const test_run_repository_1 = require("../../../infrastructure/repositories/test-run.repository");
const test_run_processor_1 = require("../../jobs/test-run.processor");
let RerunFailedTestsHandler = RerunFailedTestsHandler_1 = class RerunFailedTestsHandler {
    constructor(repo, queue, prisma) {
        this.repo = repo;
        this.queue = queue;
        this.prisma = prisma;
        this.logger = new common_1.Logger(RerunFailedTestsHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, userId, sourceRunId } = cmd;
            const sourceRun = await this.repo.findById(sourceRunId);
            if (!sourceRun)
                throw new common_1.NotFoundException(`TestRun not found: ${sourceRunId}`);
            const failedResults = await this.prisma.platform.testResult.findMany({
                where: { testRunId: sourceRunId, status: { in: ['FAIL', 'ERROR'] } },
                select: { module: true, testType: true },
            });
            const failedModules = [...new Set(failedResults.map(r => r.module).filter(Boolean))];
            const failedTypes = [...new Set(failedResults.map(r => r.testType))];
            const newRun = await this.repo.create({
                tenantId,
                testEnvId: sourceRun.testEnvId,
                runType: 'RERUN',
                testTypes: failedTypes.length > 0 ? failedTypes : sourceRun.testTypes,
                targetModules: failedModules,
                createdById: userId,
            });
            await this.queue.add('RUN_TESTS', { testRunId: newRun.id }, { attempts: 1, removeOnComplete: 20, removeOnFail: 20 });
            this.logger.log(`TestRun re-queued: ${newRun.id} (source=${sourceRunId}, modules=${failedModules.join(',')})`);
            return { id: newRun.id, status: 'QUEUED' };
        }
        catch (error) {
            this.logger.error(`RerunFailedTestsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.RerunFailedTestsHandler = RerunFailedTestsHandler;
exports.RerunFailedTestsHandler = RerunFailedTestsHandler = RerunFailedTestsHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(rerun_failed_tests_command_1.RerunFailedTestsCommand),
    __param(0, (0, common_1.Inject)(test_run_repository_1.TEST_RUN_REPOSITORY)),
    __param(1, (0, bull_1.InjectQueue)(test_run_processor_1.TEST_RUNNER_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, prisma_service_1.PrismaService])
], RerunFailedTestsHandler);
//# sourceMappingURL=rerun-failed-tests.handler.js.map