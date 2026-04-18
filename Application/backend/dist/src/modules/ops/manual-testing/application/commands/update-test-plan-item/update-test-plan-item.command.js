"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateTestPlanItemCommand = void 0;
class UpdateTestPlanItemCommand {
    constructor(itemId, planId, tenantId, userId, status, notes, errorDetails, priority, moduleName, componentName, functionality, layer) {
        this.itemId = itemId;
        this.planId = planId;
        this.tenantId = tenantId;
        this.userId = userId;
        this.status = status;
        this.notes = notes;
        this.errorDetails = errorDetails;
        this.priority = priority;
        this.moduleName = moduleName;
        this.componentName = componentName;
        this.functionality = functionality;
        this.layer = layer;
    }
}
exports.UpdateTestPlanItemCommand = UpdateTestPlanItemCommand;
//# sourceMappingURL=update-test-plan-item.command.js.map