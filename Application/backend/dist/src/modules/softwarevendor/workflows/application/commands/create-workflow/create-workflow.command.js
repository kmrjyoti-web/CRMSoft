"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateWorkflowCommand = void 0;
class CreateWorkflowCommand {
    constructor(name, code, entityType, createdById, description, isDefault, configJson) {
        this.name = name;
        this.code = code;
        this.entityType = entityType;
        this.createdById = createdById;
        this.description = description;
        this.isDefault = isDefault;
        this.configJson = configJson;
    }
}
exports.CreateWorkflowCommand = CreateWorkflowCommand;
//# sourceMappingURL=create-workflow.command.js.map