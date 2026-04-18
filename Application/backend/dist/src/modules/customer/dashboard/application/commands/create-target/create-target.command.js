"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTargetCommand = void 0;
class CreateTargetCommand {
    constructor(metric, targetValue, period, periodStart, periodEnd, createdById, userId, roleId, name, notes) {
        this.metric = metric;
        this.targetValue = targetValue;
        this.period = period;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.createdById = createdById;
        this.userId = userId;
        this.roleId = roleId;
        this.name = name;
        this.notes = notes;
    }
}
exports.CreateTargetCommand = CreateTargetCommand;
//# sourceMappingURL=create-target.command.js.map