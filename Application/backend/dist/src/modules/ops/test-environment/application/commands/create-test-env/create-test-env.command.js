"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestEnvCommand = void 0;
class CreateTestEnvCommand {
    constructor(tenantId, userId, sourceType, displayName, backupId, sourceDbUrl, ttlHours) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.sourceType = sourceType;
        this.displayName = displayName;
        this.backupId = backupId;
        this.sourceDbUrl = sourceDbUrl;
        this.ttlHours = ttlHours;
    }
}
exports.CreateTestEnvCommand = CreateTestEnvCommand;
//# sourceMappingURL=create-test-env.command.js.map