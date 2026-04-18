"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestPlanCommand = void 0;
class UpdateTestPlanCommand {
    constructor(id, tenantId, name, description, version, targetModules, status) {
        this.id = id;
        this.tenantId = tenantId;
        this.name = name;
        this.description = description;
        this.version = version;
        this.targetModules = targetModules;
        this.status = status;
    }
}
exports.UpdateTestPlanCommand = UpdateTestPlanCommand;
//# sourceMappingURL=update-test-plan.command.js.map