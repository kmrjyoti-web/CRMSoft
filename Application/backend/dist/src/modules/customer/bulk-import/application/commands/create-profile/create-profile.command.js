"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProfileCommand = void 0;
class CreateProfileCommand {
    constructor(name, targetEntity, fieldMapping, expectedHeaders, createdById, createdByName, description, sourceSystem, icon, color, defaultValues, validationRules, duplicateCheckFields, duplicateStrategy, fuzzyMatchEnabled, fuzzyMatchFields, fuzzyThreshold) {
        this.name = name;
        this.targetEntity = targetEntity;
        this.fieldMapping = fieldMapping;
        this.expectedHeaders = expectedHeaders;
        this.createdById = createdById;
        this.createdByName = createdByName;
        this.description = description;
        this.sourceSystem = sourceSystem;
        this.icon = icon;
        this.color = color;
        this.defaultValues = defaultValues;
        this.validationRules = validationRules;
        this.duplicateCheckFields = duplicateCheckFields;
        this.duplicateStrategy = duplicateStrategy;
        this.fuzzyMatchEnabled = fuzzyMatchEnabled;
        this.fuzzyMatchFields = fuzzyMatchFields;
        this.fuzzyThreshold = fuzzyThreshold;
    }
}
exports.CreateProfileCommand = CreateProfileCommand;
//# sourceMappingURL=create-profile.command.js.map