"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateScheduledTestCommand = void 0;
class UpdateScheduledTestCommand {
    constructor(id, tenantId, name, description, cronExpression, targetModules, testTypes, dbSourceType, isActive) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.cronExpression = cronExpression;
        this.targetModules = targetModules;
        this.testTypes = testTypes;
        this.dbSourceType = dbSourceType;
        this.isActive = isActive;
    }
}
exports.UpdateScheduledTestCommand = UpdateScheduledTestCommand;
//# sourceMappingURL=update-scheduled-test.command.js.map