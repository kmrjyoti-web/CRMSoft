"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationDeactivatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class OrganizationDeactivatedEvent extends domain_event_1.DomainEvent {
    constructor(organizationId, name) {
        super(organizationId, 'OrganizationDeactivated');
        this.organizationId = organizationId;
        this.name = name;
    }
}
exports.OrganizationDeactivatedEvent = OrganizationDeactivatedEvent;
//# sourceMappingURL=organization-deactivated.event.js.map