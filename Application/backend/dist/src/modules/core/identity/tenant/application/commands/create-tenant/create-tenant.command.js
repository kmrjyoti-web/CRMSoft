"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTenantCommand = void 0;
class CreateTenantCommand {
    constructor(name, slug, adminEmail, adminPassword, adminFirstName, adminLastName, planId) {
        this.name = name;
        this.slug = slug;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
        this.adminFirstName = adminFirstName;
        this.adminLastName = adminLastName;
        this.planId = planId;
    }
}
exports.CreateTenantCommand = CreateTenantCommand;
//# sourceMappingURL=create-tenant.command.js.map