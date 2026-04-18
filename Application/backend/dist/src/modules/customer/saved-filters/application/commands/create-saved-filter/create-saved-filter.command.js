"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateSavedFilterCommand = void 0;
class CreateSavedFilterCommand {
    constructor(name, entityType, filterConfig, createdById, description, isDefault, isShared, sharedWithRoles) {
        this.name = name;
        this.entityType = entityType;
        this.filterConfig = filterConfig;
        this.createdById = createdById;
        this.description = description;
        this.isDefault = isDefault;
        this.isShared = isShared;
        this.sharedWithRoles = sharedWithRoles;
    }
}
exports.CreateSavedFilterCommand = CreateSavedFilterCommand;
//# sourceMappingURL=create-saved-filter.command.js.map