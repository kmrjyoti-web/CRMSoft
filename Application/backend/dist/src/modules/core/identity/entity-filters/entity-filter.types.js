"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_ENTITY_TYPES = exports.ENTITY_FILTER_CONFIG = void 0;
exports.ENTITY_FILTER_CONFIG = {
    lead: {
        filterModel: 'leadFilter',
        fkField: 'leadId',
        entityModel: 'lead',
        uniqueConstraint: 'leadId_lookupValueId',
    },
    contact: {
        filterModel: 'contactFilter',
        fkField: 'contactId',
        entityModel: 'contact',
        uniqueConstraint: 'contactId_lookupValueId',
    },
    raw_contact: {
        filterModel: 'rawContactFilter',
        fkField: 'rawContactId',
        entityModel: 'rawContact',
        uniqueConstraint: 'rawContactId_lookupValueId',
    },
    organization: {
        filterModel: 'organizationFilter',
        fkField: 'organizationId',
        entityModel: 'organization',
        uniqueConstraint: 'organizationId_lookupValueId',
    },
};
exports.VALID_ENTITY_TYPES = Object.keys(exports.ENTITY_FILTER_CONFIG);
//# sourceMappingURL=entity-filter.types.js.map