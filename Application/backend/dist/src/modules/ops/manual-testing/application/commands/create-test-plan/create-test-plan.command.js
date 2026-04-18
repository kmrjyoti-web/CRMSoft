"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestPlanCommand = void 0;
class CreateTestPlanCommand {
    constructor(tenantId, userId, name, description, version, targetModules, items) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.name = name;
        this.description = description;
        this.version = version;
        this.targetModules = targetModules;
        this.items = items;
    }
}
exports.CreateTestPlanCommand = CreateTestPlanCommand;
//# sourceMappingURL=create-test-plan.command.js.map