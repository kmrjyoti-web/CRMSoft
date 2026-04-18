"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTourPlanCommand = void 0;
class CreateTourPlanCommand {
    constructor(title, planDate, userId, leadId, description, startLocation, endLocation, visits) {
        this.title = title;
        this.planDate = planDate;
        this.userId = userId;
        this.leadId = leadId;
        this.description = description;
        this.startLocation = startLocation;
        this.endLocation = endLocation;
        this.visits = visits;
    }
}
exports.CreateTourPlanCommand = CreateTourPlanCommand;
//# sourceMappingURL=create-tour-plan.command.js.map