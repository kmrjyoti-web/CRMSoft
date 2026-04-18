"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkContactToOrgCommand = void 0;
class LinkContactToOrgCommand {
    constructor(contactId, organizationId, relationType, isPrimary, designation, department, startDate) {
        this.contactId = contactId;
        this.organizationId = organizationId;
        this.relationType = relationType;
        this.isPrimary = isPrimary;
        this.designation = designation;
        this.department = department;
        this.startDate = startDate;
    }
}
exports.LinkContactToOrgCommand = LinkContactToOrgCommand;
//# sourceMappingURL=link-contact-to-org.command.js.map