"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePlanCommand = void 0;
class CreatePlanCommand {
    constructor(name, code, interval, price, maxUsers, maxContacts, maxLeads, maxProducts, maxStorage, features, description, currency, isActive, sortOrder) {
        this.name = name;
        this.code = code;
        this.interval = interval;
        this.price = price;
        this.maxUsers = maxUsers;
        this.maxContacts = maxContacts;
        this.maxLeads = maxLeads;
        this.maxProducts = maxProducts;
        this.maxStorage = maxStorage;
        this.features = features;
        this.description = description;
        this.currency = currency;
        this.isActive = isActive;
        this.sortOrder = sortOrder;
    }
}
exports.CreatePlanCommand = CreatePlanCommand;
//# sourceMappingURL=create-plan.command.js.map