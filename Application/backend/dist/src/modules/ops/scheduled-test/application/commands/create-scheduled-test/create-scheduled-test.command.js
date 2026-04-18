"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateScheduledTestCommand = void 0;
class CreateScheduledTestCommand {
    constructor(tenantId, userId, name, cronExpression, targetModules, testTypes, description, dbSourceType) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.name = name;
        this.cronExpression = cronExpression;
        this.targetModules = targetModules;
        this.testTypes = testTypes;
        this.description = description;
        this.dbSourceType = dbSourceType;
    }
}
exports.CreateScheduledTestCommand = CreateScheduledTestCommand;
//# sourceMappingURL=create-scheduled-test.command.js.map