"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateOrganizationCommand = void 0;
class CreateOrganizationCommand {
    constructor(name, createdById, tenantId, website, email, phone, gstNumber, address, city, state, country, pincode, industry, annualRevenue, notes, filterIds) {
        this.name = name;
        this.createdById = createdById;
        this.tenantId = tenantId;
        this.website = website;
        this.email = email;
        this.phone = phone;
        this.gstNumber = gstNumber;
        this.address = address;
        this.city = city;
        this.state = state;
        this.country = country;
        this.pincode = pincode;
        this.industry = industry;
        this.annualRevenue = annualRevenue;
        this.notes = notes;
        this.filterIds = filterIds;
    }
}
exports.CreateOrganizationCommand = CreateOrganizationCommand;
//# sourceMappingURL=create-organization.command.js.map