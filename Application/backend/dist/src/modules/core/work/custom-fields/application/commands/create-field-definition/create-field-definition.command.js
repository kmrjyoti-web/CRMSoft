"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateFieldDefinitionCommand = void 0;
class CreateFieldDefinitionCommand {
    constructor(entityType, fieldName, fieldLabel, fieldType, isRequired, defaultValue, options, sortOrder) {
        this.entityType = entityType;
        this.fieldName = fieldName;
        this.fieldLabel = fieldLabel;
        this.fieldType = fieldType;
        this.isRequired = isRequired;
        this.defaultValue = defaultValue;
        this.options = options;
        this.sortOrder = sortOrder;
    }
}
exports.CreateFieldDefinitionCommand = CreateFieldDefinitionCommand;
//# sourceMappingURL=create-field-definition.command.js.map