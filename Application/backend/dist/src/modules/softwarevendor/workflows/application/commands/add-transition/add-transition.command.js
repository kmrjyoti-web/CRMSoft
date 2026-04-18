"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddTransitionCommand = void 0;
class AddTransitionCommand {
    constructor(workflowId, fromStateId, toStateId, name, code, triggerType, conditions, actions, requiredPermission, requiredRole, sortOrder) {
        this.workflowId = workflowId;
        this.fromStateId = fromStateId;
        this.toStateId = toStateId;
        this.name = name;
        this.code = code;
        this.triggerType = triggerType;
        this.conditions = conditions;
        this.actions = actions;
        this.requiredPermission = requiredPermission;
        this.requiredRole = requiredRole;
        this.sortOrder = sortOrder;
    }
}
exports.AddTransitionCommand = AddTransitionCommand;
//# sourceMappingURL=add-transition.command.js.map