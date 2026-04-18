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
var ListScheduledTestRunsHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListScheduledTestRunsHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const list_scheduled_test_runs_query_1 = require("./list-scheduled-test-runs.query");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
const scheduled_test_run_repository_1 = require("../../../infrastructure/repositories/scheduled-test-run.repository");
let ListScheduledTestRunsHandler = ListScheduledTestRunsHandler_1 = class ListScheduledTestRunsHandler {
    constructor(testRepo, runRepo) {
        this.testRepo = testRepo;
        this.runRepo = runRepo;
        this.logger = new common_1.Logger(ListScheduledTestRunsHandler_1.name);
    }
    async execute(query) {
        try {
            const test = await this.testRepo.findById(query.scheduledTestId);
            if (!test || test.tenantId !== query.tenantId) {
                throw new common_1.NotFoundException('Scheduled test not found');
            }
            return this.runRepo.findByScheduledTestId(query.scheduledTestId, query.limit ?? 20);
        }
        catch (error) {
            this.logger.error(`ListScheduledTestRunsHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.ListScheduledTestRunsHandler = ListScheduledTestRunsHandler;
exports.ListScheduledTestRunsHandler = ListScheduledTestRunsHandler = ListScheduledTestRunsHandler_1 = __decorate([
    (0, cqrs_1.QueryHandler)(list_scheduled_test_runs_query_1.ListScheduledTestRunsQuery),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __param(1, (0, common_1.Inject)(scheduled_test_run_repository_1.SCHEDULED_TEST_RUN_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], ListScheduledTestRunsHandler);
//# sourceMappingURL=list-scheduled-test-runs.handler.js.map