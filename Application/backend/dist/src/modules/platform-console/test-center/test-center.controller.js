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
var TestCenterController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCenterController = void 0;
const common_1 = require("@nestjs/common");
const test_center_service_1 = require("./test-center.service");
const test_runner_service_1 = require("./test-runner.service");
const test_coverage_service_1 = require("./test-coverage.service");
const create_test_plan_dto_1 = require("./dto/create-test-plan.dto");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const run_tests_dto_1 = require("./dto/run-tests.dto");
let TestCenterController = TestCenterController_1 = class TestCenterController {
    constructor(testCenterService, testRunnerService, testCoverageService) {
        this.testCenterService = testCenterService;
        this.testRunnerService = testRunnerService;
        this.testCoverageService = testCoverageService;
        this.logger = new common_1.Logger(TestCenterController_1.name);
    }
    async getStats() {
        return this.testCenterService.getStats();
    }
    async getPlans(page, limit) {
        return this.testCenterService.getTestPlans({
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async createPlan(dto) {
        return this.testCenterService.createTestPlan(dto);
    }
    async getPlan(id) {
        return this.testCenterService.getTestPlan(id);
    }
    async updatePlan(id, body) {
        return this.testCenterService.updateTestPlan(id, body);
    }
    async deletePlan(id) {
        return this.testCenterService.deleteTestPlan(id);
    }
    async runTests(dto) {
        return this.testRunnerService.runTests(dto);
    }
    async runForModule(module) {
        return this.testRunnerService.runForModule(module);
    }
    async runForVertical(code) {
        return this.testRunnerService.runForVertical(code);
    }
    async getLatestExecution() {
        return this.testCenterService.getLatestExecution();
    }
    async getExecutions(status, moduleScope, triggerType, page, limit) {
        return this.testCenterService.getExecutions({
            status,
            moduleScope,
            triggerType,
            page: page ? parseInt(page, 10) : undefined,
            limit: limit ? parseInt(limit, 10) : undefined,
        });
    }
    async getExecution(id) {
        return this.testCenterService.getExecution(id);
    }
    async getSchedules() {
        return this.testCenterService.getSchedules();
    }
    async createSchedule(dto) {
        return this.testCenterService.createSchedule(dto);
    }
    async updateSchedule(id, body) {
        return this.testCenterService.updateSchedule(id, body);
    }
    async deleteSchedule(id) {
        return this.testCenterService.deleteSchedule(id);
    }
    async getCoverageOverview() {
        return this.testCoverageService.getCoverageOverview();
    }
    async refreshCoverage() {
        return this.testCoverageService.refreshCoverage();
    }
    async getModuleCoverage(module) {
        return this.testCoverageService.getModuleCoverage(module);
    }
};
exports.TestCenterController = TestCenterController;
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('plans'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getPlans", null);
__decorate([
    (0, common_1.Post)('plans'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_test_plan_dto_1.CreateTestPlanDto]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "createPlan", null);
__decorate([
    (0, common_1.Get)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getPlan", null);
__decorate([
    (0, common_1.Patch)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "updatePlan", null);
__decorate([
    (0, common_1.Delete)('plans/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "deletePlan", null);
__decorate([
    (0, common_1.Post)('run'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [run_tests_dto_1.RunTestsDto]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "runTests", null);
__decorate([
    (0, common_1.Post)('run/module/:module'),
    __param(0, (0, common_1.Param)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "runForModule", null);
__decorate([
    (0, common_1.Post)('run/vertical/:code'),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "runForVertical", null);
__decorate([
    (0, common_1.Get)('executions/latest'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getLatestExecution", null);
__decorate([
    (0, common_1.Get)('executions'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('moduleScope')),
    __param(2, (0, common_1.Query)('triggerType')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getExecutions", null);
__decorate([
    (0, common_1.Get)('executions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getExecution", null);
__decorate([
    (0, common_1.Get)('schedules'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getSchedules", null);
__decorate([
    (0, common_1.Post)('schedules'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "createSchedule", null);
__decorate([
    (0, common_1.Patch)('schedules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "updateSchedule", null);
__decorate([
    (0, common_1.Delete)('schedules/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "deleteSchedule", null);
__decorate([
    (0, common_1.Get)('coverage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getCoverageOverview", null);
__decorate([
    (0, common_1.Post)('coverage/refresh'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "refreshCoverage", null);
__decorate([
    (0, common_1.Get)('coverage/:module'),
    __param(0, (0, common_1.Param)('module')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestCenterController.prototype, "getModuleCoverage", null);
exports.TestCenterController = TestCenterController = TestCenterController_1 = __decorate([
    (0, common_1.Controller)('platform-console/tests'),
    __metadata("design:paramtypes", [test_center_service_1.TestCenterService,
        test_runner_service_1.TestRunnerService,
        test_coverage_service_1.TestCoverageService])
], TestCenterController);
//# sourceMappingURL=test-center.controller.js.map