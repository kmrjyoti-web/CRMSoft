"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTestRunCommand = void 0;
class CreateTestRunCommand {
    constructor(tenantId, userId, testTypes, targetModules, runType, testEnvId) {
        this.tenantId = tenantId;
        this.userId = userId;
        this.testTypes = testTypes;
        this.targetModules = targetModules;
        this.runType = runType;
        this.testEnvId = testEnvId;
    }
}
exports.CreateTestRunCommand = CreateTestRunCommand;
//# sourceMappingURL=create-test-run.command.js.map