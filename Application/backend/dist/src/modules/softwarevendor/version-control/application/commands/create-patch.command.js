"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePatchCommand = void 0;
class CreatePatchCommand {
    constructor(versionId, industryCode, patchName, description, schemaChanges, configOverrides, menuOverrides, forceUpdate, createdBy) {
        this.versionId = versionId;
        this.industryCode = industryCode;
        this.patchName = patchName;
        this.description = description;
        this.schemaChanges = schemaChanges;
        this.configOverrides = configOverrides;
        this.menuOverrides = menuOverrides;
        this.forceUpdate = forceUpdate;
        this.createdBy = createdBy;
    }
}
exports.CreatePatchCommand = CreatePatchCommand;
//# sourceMappingURL=create-patch.command.js.map