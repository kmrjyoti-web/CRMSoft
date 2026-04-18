"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateVersionCommand = void 0;
class CreateVersionCommand {
    constructor(version, releaseType, changelog, breakingChanges, migrationNotes, codeName, gitBranch, createdBy) {
        this.version = version;
        this.releaseType = releaseType;
        this.changelog = changelog;
        this.breakingChanges = breakingChanges;
        this.migrationNotes = migrationNotes;
        this.codeName = codeName;
        this.gitBranch = gitBranch;
        this.createdBy = createdBy;
    }
}
exports.CreateVersionCommand = CreateVersionCommand;
//# sourceMappingURL=create-version.command.js.map