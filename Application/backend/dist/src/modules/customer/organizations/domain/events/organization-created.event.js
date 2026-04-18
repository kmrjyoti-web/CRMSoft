"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationCreatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class OrganizationCreatedEvent extends domain_event_1.DomainEvent {
    constructor(organizationId, name, industry, createdById) {
        super(organizationId, 'OrganizationCreated');
        this.organizationId = organizationId;
        this.name = name;
        this.industry = industry;
        this.createdById = createdById;
    }
}
exports.OrganizationCreatedEvent = OrganizationCreatedEvent;
//# sourceMappingURL=organization-created.event.js.map