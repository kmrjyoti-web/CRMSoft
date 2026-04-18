"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateLeadCommand = void 0;
class CreateLeadCommand {
    constructor(contactId, createdById, organizationId, priority, expectedValue, expectedCloseDate, notes, filterIds) {
        this.contactId = contactId;
        this.createdById = createdById;
        this.organizationId = organizationId;
        this.priority = priority;
        this.expectedValue = expectedValue;
        this.expectedCloseDate = expectedCloseDate;
        this.notes = notes;
        this.filterIds = filterIds;
    }
}
exports.CreateLeadCommand = CreateLeadCommand;
//# sourceMappingURL=create-lead.command.js.map