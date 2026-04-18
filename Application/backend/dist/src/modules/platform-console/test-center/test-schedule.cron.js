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
var TestScheduleCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestScheduleCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const platform_console_prisma_service_1 = require("../prisma/platform-console-prisma.service");
const test_runner_service_1 = require("./test-runner.service");
const test_coverage_service_1 = require("./test-coverage.service");
let TestScheduleCron = TestScheduleCron_1 = class TestScheduleCron {
    constructor(db, testRunner, coverageService) {
        this.db = db;
        this.testRunner = testRunner;
        this.coverageService = coverageService;
        this.logger = new common_1.Logger(TestScheduleCron_1.name);
    }
    async checkSchedules() {
        try {
            const now = new Date();
            const dueSchedules = await this.db.pcTestSchedule.findMany({
                where: {
                    isActive: true,
                    nextRun: { lte: now },
                },
            });
            for (const schedule of dueSchedules) {
                try {
                    this.logger.log(`Triggering scheduled test run: ${schedule.id} (${schedule.scheduleType})`);
                    await this.testRunner.runTests({
                        moduleScope: schedule.moduleScope || undefined,
                        verticalScope: schedule.verticalScope || undefined,
                        planId: schedule.planId || undefined,
                        triggerType: 'SCHEDULED',
                    });
                    await this.db.pcTestSchedule.update({
                        where: { id: schedule.id },
                        data: {
                            lastRun: now,
                            nextRun: null,
                        },
                    });
                }
                catch (scheduleError) {
                    this.logger.error(`Failed to execute schedule ${schedule.id}`, scheduleError.stack);
                }
            }
        }
        catch (error) {
            this.logger.error('Failed to check test schedules', error.stack);
        }
    }
    async nightlyTestRun() {
        try {
            this.logger.log('Starting nightly test run');
            const execution = await this.testRunner.runTests({ triggerType: 'SCHEDULED' });
            this.logger.log(`Nightly test run started: ${execution.id}`);
        }
        catch (error) {
            this.logger.error('Nightly test run failed', error.stack);
        }
    }
    async weeklyCoverageRefresh() {
        try {
            this.logger.log('Starting weekly coverage refresh');
            const results = await this.coverageService.refreshCoverage();
            this.logger.log(`Weekly coverage refresh completed: ${results.length} modules`);
        }
        catch (error) {
            this.logger.error('Weekly coverage refresh failed', error.stack);
        }
    }
};
exports.TestScheduleCron = TestScheduleCron;
__decorate([
    (0, schedule_1.Cron)('* * * * *', { name: 'test-schedule-check', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestScheduleCron.prototype, "checkSchedules", null);
__decorate([
    (0, schedule_1.Cron)('30 17 * * *', { name: 'nightly-test-run', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestScheduleCron.prototype, "nightlyTestRun", null);
__decorate([
    (0, schedule_1.Cron)('30 2 * * 0', { name: 'weekly-coverage', timeZone: 'Asia/Kolkata' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestScheduleCron.prototype, "weeklyCoverageRefresh", null);
exports.TestScheduleCron = TestScheduleCron = TestScheduleCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [platform_console_prisma_service_1.PlatformConsolePrismaService,
        test_runner_service_1.TestRunnerService,
        test_coverage_service_1.TestCoverageService])
], TestScheduleCron);
//# sourceMappingURL=test-schedule.cron.js.map