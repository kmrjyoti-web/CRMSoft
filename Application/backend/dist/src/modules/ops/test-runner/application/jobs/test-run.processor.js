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
var TestRunProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestRunProcessor = exports.TEST_RUNNER_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const test_orchestrator_service_1 = require("../services/test-orchestrator.service");
exports.TEST_RUNNER_QUEUE = 'ops-test-runner';
let TestRunProcessor = TestRunProcessor_1 = class TestRunProcessor {
    constructor(orchestrator, prisma) {
        this.orchestrator = orchestrator;
        this.prisma = prisma;
        this.logger = new common_1.Logger(TestRunProcessor_1.name);
    }
    async handleRunTests(job) {
        const { testRunId } = job.data;
        const testRun = await this.prisma.platform.testRun.findUnique({ where: { id: testRunId } });
        if (!testRun)
            throw new Error(`TestRun not found: ${testRunId}`);
        this.logger.log(`Processing TestRun: ${testRunId}`);
        await this.prisma.platform.testRun.update({
            where: { id: testRunId },
            data: { status: 'RUNNING', startedAt: new Date() },
        });
        try {
            await this.orchestrator.runAll(testRunId, testRun.testTypes.map(t => t), {
                targetModules: testRun.targetModules?.length ? testRun.targetModules : undefined,
            });
        }
        catch (error) {
            this.logger.error(`TestRun ${testRunId} failed: ${error.message}`);
            await this.prisma.platform.testRun.update({
                where: { id: testRunId },
                data: {
                    status: 'FAILED',
                    currentPhase: `Error: ${error.message?.substring(0, 200)}`,
                    completedAt: new Date(),
                },
            });
            throw error;
        }
    }
};
exports.TestRunProcessor = TestRunProcessor;
__decorate([
    (0, bull_1.Process)('RUN_TESTS'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestRunProcessor.prototype, "handleRunTests", null);
exports.TestRunProcessor = TestRunProcessor = TestRunProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.TEST_RUNNER_QUEUE),
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [test_orchestrator_service_1.TestOrchestratorService,
        prisma_service_1.PrismaService])
], TestRunProcessor);
//# sourceMappingURL=test-run.processor.js.map