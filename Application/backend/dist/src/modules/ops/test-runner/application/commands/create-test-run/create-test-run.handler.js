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
var CreateTestRunHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestRunHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const create_test_run_command_1 = require("./create-test-run.command");
const test_run_repository_1 = require("../../../infrastructure/repositories/test-run.repository");
const test_run_processor_1 = require("../../jobs/test-run.processor");
const MAX_CONCURRENT_RUNS = 2;
let CreateTestRunHandler = CreateTestRunHandler_1 = class CreateTestRunHandler {
    constructor(repo, queue) {
        this.repo = repo;
        this.queue = queue;
        this.logger = new common_1.Logger(CreateTestRunHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { tenantId, userId, testTypes, targetModules, runType, testEnvId } = cmd;
            const running = await this.repo.countRunning(tenantId);
            if (running >= MAX_CONCURRENT_RUNS) {
                throw new common_1.BadRequestException(`Maximum ${MAX_CONCURRENT_RUNS} concurrent test runs per tenant. Wait for an existing run to complete.`);
            }
            const testRun = await this.repo.create({
                tenantId,
                testEnvId,
                runType,
                testTypes: testTypes.length > 0 ? testTypes : ['UNIT', 'FUNCTIONAL', 'SMOKE', 'INTEGRATION', 'ARCHITECTURE', 'PENETRATION'],
                targetModules: targetModules ?? [],
                createdById: userId,
            });
            await this.queue.add('RUN_TESTS', { testRunId: testRun.id }, { attempts: 1, removeOnComplete: 20, removeOnFail: 20 });
            this.logger.log(`TestRun queued: ${testRun.id} (type=${runType}, tests=${testRun.testTypes.join(',')})`);
            return { id: testRun.id, status: 'QUEUED' };
        }
        catch (error) {
            this.logger.error(`CreateTestRunHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CreateTestRunHandler = CreateTestRunHandler;
exports.CreateTestRunHandler = CreateTestRunHandler = CreateTestRunHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_test_run_command_1.CreateTestRunCommand),
    __param(0, (0, common_1.Inject)(test_run_repository_1.TEST_RUN_REPOSITORY)),
    __param(1, (0, bull_1.InjectQueue)(test_run_processor_1.TEST_RUNNER_QUEUE)),
    __metadata("design:paramtypes", [Object, Object])
], CreateTestRunHandler);
//# sourceMappingURL=create-test-run.handler.js.map