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
var TriggerScheduledTestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TriggerScheduledTestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const trigger_scheduled_test_command_1 = require("./trigger-scheduled-test.command");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
const scheduled_test_run_repository_1 = require("../../../infrastructure/repositories/scheduled-test-run.repository");
const scheduled_test_processor_1 = require("../../jobs/scheduled-test.processor");
let TriggerScheduledTestHandler = TriggerScheduledTestHandler_1 = class TriggerScheduledTestHandler {
    constructor(repo, runRepo, queue) {
        this.repo = repo;
        this.runRepo = runRepo;
        this.queue = queue;
        this.logger = new common_1.Logger(TriggerScheduledTestHandler_1.name);
    }
    async execute(cmd) {
        try {
            const test = await this.repo.findById(cmd.id);
            if (!test || test.tenantId !== cmd.tenantId) {
                throw new common_1.NotFoundException('Scheduled test not found');
            }
            const run = await this.runRepo.create({
                scheduledTestId: test.id,
                status: 'QUEUED',
            });
            await this.queue.add('EXECUTE_SCHEDULED_TEST', { scheduledTestId: test.id, scheduledTestRunId: run.id, triggeredBy: cmd.userId }, { attempts: 1, removeOnComplete: 20, removeOnFail: 20 });
            this.logger.log(`ScheduledTest manually triggered: ${test.id} → run=${run.id}`);
            return { runId: run.id };
        }
        catch (error) {
            this.logger.error(`TriggerScheduledTestHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.TriggerScheduledTestHandler = TriggerScheduledTestHandler;
exports.TriggerScheduledTestHandler = TriggerScheduledTestHandler = TriggerScheduledTestHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(trigger_scheduled_test_command_1.TriggerScheduledTestCommand),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(scheduled_test_run_repository_1.SCHEDULED_TEST_RUN_REPOSITORY)),
    __param(2, (0, bull_1.InjectQueue)(scheduled_test_processor_1.SCHEDULED_TEST_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], TriggerScheduledTestHandler);
//# sourceMappingURL=trigger-scheduled-test.handler.js.map