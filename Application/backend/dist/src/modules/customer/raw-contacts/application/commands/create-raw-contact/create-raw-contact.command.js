"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateRawContactCommand = void 0;
class CreateRawContactCommand {
    constructor(firstName, lastName, createdById, source, companyName, designation, department, notes, communications, filterIds) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.createdById = createdById;
        this.source = source;
        this.companyName = companyName;
        this.designation = designation;
        this.department = department;
        this.notes = notes;
        this.communications = communications;
        this.filterIds = filterIds;
    }
}
exports.CreateRawContactCommand = CreateRawContactCommand;
//# sourceMappingURL=create-raw-contact.command.js.map