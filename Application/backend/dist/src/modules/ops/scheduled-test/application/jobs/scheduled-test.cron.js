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
var ScheduledTestCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduledTestCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const bull_1 = require("@nestjs/bull");
const scheduled_test_repository_1 = require("../../infrastructure/repositories/scheduled-test.repository");
const scheduled_test_run_repository_1 = require("../../infrastructure/repositories/scheduled-test-run.repository");
const scheduled_test_processor_1 = require("./scheduled-test.processor");
let ScheduledTestCron = ScheduledTestCron_1 = class ScheduledTestCron {
    constructor(testRepo, runRepo, queue) {
        this.testRepo = testRepo;
        this.runRepo = runRepo;
        this.queue = queue;
        this.logger = new common_1.Logger(ScheduledTestCron_1.name);
    }
    async dispatchDueTests() {
        const dueTests = await this.testRepo.findDue();
        if (dueTests.length === 0)
            return;
        this.logger.log(`Dispatching ${dueTests.length} due scheduled test(s)`);
        for (const test of dueTests) {
            try {
                const run = await this.runRepo.create({
                    scheduledTestId: test.id,
                    status: 'QUEUED',
                });
                await this.queue.add('EXECUTE_SCHEDULED_TEST', { scheduledTestId: test.id, scheduledTestRunId: run.id }, { attempts: 1, removeOnComplete: 20, removeOnFail: 20 });
                this.logger.log(`Dispatched scheduled test: ${test.name} (${test.id}) ? run=${run.id}`);
            }
            catch (err) {
                this.logger.error(`Failed to dispatch scheduled test ${test.id}: ${err.message}`);
            }
        }
    }
};
exports.ScheduledTestCron = ScheduledTestCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduledTestCron.prototype, "dispatchDueTests", null);
exports.ScheduledTestCron = ScheduledTestCron = ScheduledTestCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(scheduled_test_run_repository_1.SCHEDULED_TEST_RUN_REPOSITORY)),
    __param(2, (0, bull_1.InjectQueue)(scheduled_test_processor_1.SCHEDULED_TEST_QUEUE)),
    __metadata("design:paramtypes", [Object, Object, Object])
], ScheduledTestCron);
//# sourceMappingURL=scheduled-test.cron.js.map