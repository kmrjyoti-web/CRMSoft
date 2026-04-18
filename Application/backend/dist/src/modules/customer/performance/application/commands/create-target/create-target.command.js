"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTargetCommand = void 0;
class CreateTargetCommand {
    constructor(createdById, metric, targetValue, period, periodStart, periodEnd, name, userId, roleId, notes) {
        this.createdById = createdById;
        this.metric = metric;
        this.targetValue = targetValue;
        this.period = period;
        this.periodStart = periodStart;
        this.periodEnd = periodEnd;
        this.name = name;
        this.userId = userId;
        this.roleId = roleId;
        this.notes = notes;
    }
}
exports.CreateTargetCommand = CreateTargetCommand;
//# sourceMappingURL=create-target.command.js.map