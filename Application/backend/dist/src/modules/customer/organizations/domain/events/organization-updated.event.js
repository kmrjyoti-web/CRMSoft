"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrganizationUpdatedEvent = void 0;
const domain_event_1 = require("../../../../../shared/domain/domain-event");
class OrganizationUpdatedEvent extends domain_event_1.DomainEvent {
    constructor(organizationId, name) {
        super(organizationId, 'OrganizationUpdated');
        this.organizationId = organizationId;
        this.name = name;
    }
}
exports.OrganizationUpdatedEvent = OrganizationUpdatedEvent;
//# sourceMappingURL=organization-updated.event.js.map