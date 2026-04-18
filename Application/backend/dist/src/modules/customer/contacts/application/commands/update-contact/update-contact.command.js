"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateContactCommand = void 0;
class UpdateContactCommand {
    constructor(contactId, updatedById, data, filterIds, communications, organizationId) {
        this.contactId = contactId;
        this.updatedById = updatedById;
        this.data = data;
        this.filterIds = filterIds;
        this.communications = communications;
        this.organizationId = organizationId;
    }
}
exports.UpdateContactCommand = UpdateContactCommand;
//# sourceMappingURL=update-contact.command.js.map