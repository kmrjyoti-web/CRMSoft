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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScheduledTestHandler = void 0;
const cqrs_1 = require("@nestjs/cqrs");
const common_1 = require("@nestjs/common");
const cron_parser_1 = require("cron-parser");
const update_scheduled_test_command_1 = require("./update-scheduled-test.command");
const scheduled_test_repository_1 = require("../../../infrastructure/repositories/scheduled-test.repository");
let UpdateScheduledTestHandler = class UpdateScheduledTestHandler {
    constructor(repo) {
        this.repo = repo;
    }
    async execute(cmd) {
        const existing = await this.repo.findById(cmd.id);
        if (!existing || existing.tenantId !== cmd.tenantId) {
            throw new common_1.NotFoundException('Scheduled test not found');
        }
        const updates = {};
        if (cmd.name !== undefined)
            updates.name = cmd.name;
        if (cmd.description !== undefined)
            updates.description = cmd.description;
        if (cmd.cronExpression !== undefined) {
            updates.cronExpression = cmd.cronExpression;
            updates.nextRunAt = this.computeNextRun(cmd.cronExpression);
        }
        if (cmd.targetModules !== undefined)
            updates.targetModules = cmd.targetModules;
        if (cmd.testTypes !== undefined)
            updates.testTypes = cmd.testTypes;
        if (cmd.dbSourceType !== undefined)
            updates.dbSourceType = cmd.dbSourceType;
        if (cmd.isActive !== undefined)
            updates.isActive = cmd.isActive;
        return this.repo.update(cmd.id, updates);
    }
    computeNextRun(cronExpression) {
        try {
            return cron_parser_1.CronExpressionParser.parse(cronExpression).next().toDate();
        }
        catch {
            const d = new Date();
            d.setHours(d.getHours() + 1, 0, 0, 0);
            return d;
        }
    }
};
exports.UpdateScheduledTestHandler = UpdateScheduledTestHandler;
exports.UpdateScheduledTestHandler = UpdateScheduledTestHandler = __decorate([
    (0, cqrs_1.CommandHandler)(update_scheduled_test_command_1.UpdateScheduledTestCommand),
    __param(0, (0, common_1.Inject)(scheduled_test_repository_1.SCHEDULED_TEST_REPOSITORY)),
    __metadata("design:paramtypes", [Object])
], UpdateScheduledTestHandler);
//# sourceMappingURL=update-scheduled-test.handler.js.map