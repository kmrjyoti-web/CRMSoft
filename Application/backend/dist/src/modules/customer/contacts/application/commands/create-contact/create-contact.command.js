"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactCommand = void 0;
class CreateContactCommand {
    constructor(firstName, lastName, createdById, designation, department, notes, communications, organizationId, orgRelationType, filterIds) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdById = createdById;
        this.designation = designation;
        this.department = department;
        this.notes = notes;
        this.communications = communications;
        this.organizationId = organizationId;
        this.orgRelationType = orgRelationType;
        this.filterIds = filterIds;
    }
}
exports.CreateContactCommand = CreateContactCommand;
//# sourceMappingURL=create-contact.command.js.map