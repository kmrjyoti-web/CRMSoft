"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddCommunicationCommand = void 0;
class AddCommunicationCommand {
    constructor(type, value, priorityType, isPrimary, label, rawContactId, contactId, organizationId, leadId) {
        this.type = type;
        this.value = value;
        this.priorityType = priorityType;
        this.isPrimary = isPrimary;
        this.label = label;
        this.rawContactId = rawContactId;
        this.contactId = contactId;
        this.organizationId = organizationId;
        this.leadId = leadId;
    }
}
exports.AddCommunicationCommand = AddCommunicationCommand;
//# sourceMappingURL=add-communication.command.js.map