"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddStateCommand = void 0;
class AddStateCommand {
    constructor(workflowId, name, code, stateType, category, color, icon, sortOrder, metadata) {
        this.workflowId = workflowId;
        this.name = name;
        this.code = code;
        this.stateType = stateType;
        this.category = category;
        this.color = color;
        this.icon = icon;
        this.sortOrder = sortOrder;
        this.metadata = metadata;
    }
}
exports.AddStateCommand = AddStateCommand;
//# sourceMappingURL=add-state.command.js.map