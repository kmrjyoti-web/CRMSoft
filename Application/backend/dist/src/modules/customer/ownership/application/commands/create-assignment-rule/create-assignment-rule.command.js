"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateAssignmentRuleCommand = void 0;
class CreateAssignmentRuleCommand {
    constructor(name, entityType, triggerEvent, conditions, assignmentMethod, createdById, description, assignToUserId, assignToTeamIds, assignToRoleId, ownerType, priority, maxPerUser, respectWorkload, escalateAfterHours, escalateToUserId, escalateToRoleId) {
        this.name = name;
        this.entityType = entityType;
        this.triggerEvent = triggerEvent;
        this.conditions = conditions;
        this.assignmentMethod = assignmentMethod;
        this.createdById = createdById;
        this.description = description;
        this.assignToUserId = assignToUserId;
        this.assignToTeamIds = assignToTeamIds;
        this.assignToRoleId = assignToRoleId;
        this.ownerType = ownerType;
        this.priority = priority;
        this.maxPerUser = maxPerUser;
        this.respectWorkload = respectWorkload;
        this.escalateAfterHours = escalateAfterHours;
        this.escalateToUserId = escalateToUserId;
        this.escalateToRoleId = escalateToRoleId;
    }
}
exports.CreateAssignmentRuleCommand = CreateAssignmentRuleCommand;
//# sourceMappingURL=create-assignment-rule.command.js.map