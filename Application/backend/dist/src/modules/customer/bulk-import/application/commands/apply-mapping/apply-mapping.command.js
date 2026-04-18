"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplyMappingCommand = void 0;
class ApplyMappingCommand {
    constructor(jobId, fieldMapping, validationRules, duplicateCheckFields, duplicateStrategy, fuzzyMatchEnabled, fuzzyMatchFields, fuzzyThreshold, defaultValues) {
        this.jobId = jobId;
        this.fieldMapping = fieldMapping;
        this.validationRules = validationRules;
        this.duplicateCheckFields = duplicateCheckFields;
        this.duplicateStrategy = duplicateStrategy;
        this.fuzzyMatchEnabled = fuzzyMatchEnabled;
        this.fuzzyMatchFields = fuzzyMatchFields;
        this.fuzzyThreshold = fuzzyThreshold;
        this.defaultValues = defaultValues;
    }
}
exports.ApplyMappingCommand = ApplyMappingCommand;
//# sourceMappingURL=apply-mapping.command.js.map