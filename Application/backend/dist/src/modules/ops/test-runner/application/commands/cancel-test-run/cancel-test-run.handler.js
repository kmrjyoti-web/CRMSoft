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
var CancelTestRunHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CancelTestRunHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cancel_test_run_command_1 = require("./cancel-test-run.command");
const test_run_repository_1 = require("../../../infrastructure/repositories/test-run.repository");
let CancelTestRunHandler = CancelTestRunHandler_1 = class CancelTestRunHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(CancelTestRunHandler_1.name);
    }
    async execute(cmd) {
        try {
            const { testRunId } = cmd;
            const testRun = await this.repo.findById(testRunId);
            if (!testRun)
                throw new common_1.NotFoundException(`TestRun not found: ${testRunId}`);
            if (!['QUEUED', 'RUNNING'].includes(testRun.status)) {
                throw new common_1.BadRequestException(`Cannot cancel a run in status: ${testRun.status}`);
            }
            await this.repo.update(testRunId, {
                status: 'CANCELLED',
                currentPhase: 'Cancelled by user',
                completedAt: new Date(),
            });
            return { id: testRunId, status: 'CANCELLED' };
        }
        catch (error) {
            this.logger.error(`CancelTestRunHandler failed: ${error.message}`, error.stack);
            throw error;
        }
    }
};
exports.CancelTestRunHandler = CancelTestRunHandler;
exports.CancelTestRunHandler = CancelTestRunHandler = CancelTestRunHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(cancel_test_run_command_1.CancelTestRunCommand),
    __param(0, (0, common_1.Inject)(test_run_repository_1.TEST_RUN_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CancelTestRunHandler);
//# sourceMappingURL=cancel-test-run.handler.js.map