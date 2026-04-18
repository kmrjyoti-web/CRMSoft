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
var TestOrchestratorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestOrchestratorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../../../core/prisma/prisma.service");
const platform_client_1 = require("@prisma/platform-client");
const unit_test_runner_1 = require("../../infrastructure/runners/unit-test.runner");
const functional_test_runner_1 = require("../../infrastructure/runners/functional-test.runner");
const smoke_test_runner_1 = require("../../infrastructure/runners/smoke-test.runner");
const architecture_test_runner_1 = require("../../infrastructure/runners/architecture-test.runner");
const penetration_test_runner_1 = require("../../infrastructure/runners/penetration-test.runner");
const integration_test_runner_1 = require("../../infrastructure/runners/integration-test.runner");
const RUN_ORDER = [
    platform_client_1.TestType.SMOKE,
    platform_client_1.TestType.UNIT,
    platform_client_1.TestType.INTEGRATION,
    platform_client_1.TestType.FUNCTIONAL,
    platform_client_1.TestType.ARCHITECTURE,
    platform_client_1.TestType.PENETRATION,
];
let TestOrchestratorService = TestOrchestratorService_1 = class TestOrchestratorService {
    constructor(prisma, unitRunner, functionalRunner, smokeRunner, architectureRunner, penetrationRunner, integrationRunner) {
        this.prisma = prisma;
        this.unitRunner = unitRunner;
        this.functionalRunner = functionalRunner;
        this.smokeRunner = smokeRunner;
        this.architectureRunner = architectureRunner;
        this.penetrationRunner = penetrationRunner;
        this.integrationRunner = integrationRunner;
        this.logger = new common_1.Logger(TestOrchestratorService_1.name);
        this.runners = new Map([
            [platform_client_1.TestType.UNIT, unitRunner],
            [platform_client_1.TestType.FUNCTIONAL, functionalRunner],
            [platform_client_1.TestType.SMOKE, smokeRunner],
            [platform_client_1.TestType.INTEGRATION, integrationRunner],
            [platform_client_1.TestType.ARCHITECTURE, architectureRunner],
            [platform_client_1.TestType.PENETRATION, penetrationRunner],
        ]);
    }
    async runAll(testRunId, testTypes, config) {
        const typesToRun = testTypes.length > 0 ? testTypes : Array.from(this.runners.keys());
        const runOrder = RUN_ORDER.filter(t => typesToRun.includes(t));
        const summary = {};
        let totalTests = 0, totalPassed = 0, totalFailed = 0, totalSkipped = 0, totalErrors = 0, totalDuration = 0;
        let coveragePercent;
        for (let i = 0; i < runOrder.length; i++) {
            const type = runOrder[i];
            const runner = this.runners.get(type);
            if (!runner)
                continue;
            const progress = Math.round((i / runOrder.length) * 100);
            await this.prisma.platform.testRun.update({
                where: { id: testRunId },
                data: { progressPercent: progress, currentPhase: `Running ${type.toLowerCase()} tests...` },
            });
            this.logger.log(`TestRun ${testRunId}: starting ${type}`);
            const result = await runner.run(config);
            this.logger.log(`TestRun ${testRunId}: ${type} done — ${result.passed}/${result.total} passed`);
            if (result.results.length > 0) {
                await this.prisma.platform.testResult.createMany({
                    data: result.results.map(r => ({
                        testRunId,
                        testType: type,
                        suiteName: r.suiteName,
                        testName: r.testName,
                        filePath: r.filePath,
                        module: r.module,
                        status: r.status,
                        duration: r.duration,
                        errorMessage: r.errorMessage,
                        errorStack: r.errorStack,
                        expectedValue: r.expectedValue,
                        actualValue: r.actualValue,
                    })),
                });
            }
            totalTests += result.total;
            totalPassed += result.passed;
            totalFailed += result.failed;
            totalSkipped += result.skipped;
            totalErrors += result.errors;
            totalDuration += result.duration;
            if (result.coveragePercent !== undefined)
                coveragePercent = result.coveragePercent;
            summary[type] = {
                total: result.total,
                passed: result.passed,
                failed: result.failed,
                skipped: result.skipped,
                errors: result.errors,
                duration: result.duration,
            };
        }
        const finalStatus = totalFailed > 0 || totalErrors > 0 ? 'FAILED' : 'COMPLETED';
        await this.prisma.platform.testRun.update({
            where: { id: testRunId },
            data: {
                status: finalStatus,
                progressPercent: 100,
                currentPhase: totalFailed > 0 ? `${totalFailed} tests failed` : 'All tests passed',
                totalTests,
                passed: totalPassed,
                failed: totalFailed,
                skipped: totalSkipped,
                errors: totalErrors,
                duration: totalDuration,
                summary,
                coveragePercent,
                completedAt: new Date(),
            },
        });
        this.logger.log(`TestRun ${testRunId}: ${finalStatus} — ${totalPassed}/${totalTests} passed`);
    }
};
exports.TestOrchestratorService = TestOrchestratorService;
exports.TestOrchestratorService = TestOrchestratorService = TestOrchestratorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        unit_test_runner_1.UnitTestRunner,
        functional_test_runner_1.FunctionalTestRunner,
        smoke_test_runner_1.SmokeTestRunner,
        architecture_test_runner_1.ArchitectureTestRunner,
        penetration_test_runner_1.PenetrationTestRunner,
        integration_test_runner_1.IntegrationTestRunner])
], TestOrchestratorService);
//# sourceMappingURL=test-orchestrator.service.js.map