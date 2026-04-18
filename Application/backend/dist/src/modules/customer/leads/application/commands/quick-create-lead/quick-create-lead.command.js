"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuickCreateLeadCommand = void 0;
class QuickCreateLeadCommand {
    constructor(createdById, contactId, inlineContact, organizationId, inlineOrganization, priority, expectedValue, expectedCloseDate, notes, filterIds) {
        this.createdById = createdById;
        this.contactId = contactId;
        this.inlineContact = inlineContact;
        this.organizationId = organizationId;
        this.inlineOrganization = inlineOrganization;
        this.priority = priority;
        this.expectedValue = expectedValue;
        this.expectedCloseDate = expectedCloseDate;
        this.notes = notes;
        this.filterIds = filterIds;
    }
}
exports.QuickCreateLeadCommand = QuickCreateLeadCommand;
//# sourceMappingURL=quick-create-lead.command.js.map