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
var CreateScheduledTestHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScheduledTestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cron_parser_1 = require("cron-parser");
const create_scheduled_test_command_1 = require("./create-scheduled-test.command");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
let CreateScheduledTestHandler = CreateScheduledTestHandler_1 = class CreateScheduledTestHandler {
    constructor(repo) {
        this.repo = repo;
        this.logger = new common_1.Logger(CreateScheduledTestHandler_1.name);
    }
    async execute(cmd) {
        const { tenantId, userId, name, description, cronExpression, targetModules, testTypes, dbSourceType } = cmd;
        const nextRunAt = this.computeNextRun(cronExpression);
        const test = await this.repo.create({
            tenantId,
            name,
            description,
            cronExpression,
            targetModules,
            testTypes: testTypes.length > 0 ? testTypes : ['UNIT', 'FUNCTIONAL', 'SMOKE'],
            dbSourceType: dbSourceType ?? 'BACKUP_RESTORE',
            createdById: userId,
            nextRunAt,
        });
        this.logger.log(`ScheduledTest created: ${test.id} (cron=${cronExpression}, nextRun=${nextRunAt})`);
        return test;
    }
    computeNextRun(cronExpression) {
        try {
            const interval = cron_parser_1.CronExpressionParser.parse(cronExpression);
            return interval.next().toDate();
        }
        catch {
            const d = new Date();
            d.setHours(d.getHours() + 1, 0, 0, 0);
            return d;
        }
    }
};
exports.CreateScheduledTestHandler = CreateScheduledTestHandler;
exports.CreateScheduledTestHandler = CreateScheduledTestHandler = CreateScheduledTestHandler_1 = __decorate([
    (0, cqrs_1.CommandHandler)(create_scheduled_test_command_1.CreateScheduledTestCommand),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], CreateScheduledTestHandler);
//# sourceMappingURL=create-scheduled-test.handler.js.map