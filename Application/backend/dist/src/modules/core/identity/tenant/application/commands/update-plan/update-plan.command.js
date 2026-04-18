"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePlanCommand = void 0;
class UpdatePlanCommand {
    constructor(planId, name, description, price, maxUsers, maxContacts, maxLeads, maxProducts, maxStorage, features, isActive, sortOrder) {
        this.planId = planId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.maxUsers = maxUsers;
        this.maxContacts = maxContacts;
        this.maxLeads = maxLeads;
        this.maxProducts = maxProducts;
        this.maxStorage = maxStorage;
        this.features = features;
        this.isActive = isActive;
        this.sortOrder = sortOrder;
    }
}
exports.UpdatePlanCommand = UpdatePlanCommand;
//# sourceMappingURL=update-plan.command.js.map