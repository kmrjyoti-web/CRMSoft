export declare const ENTITY_FILTER_CONFIG: {
    readonly lead: {
        readonly filterModel: "leadFilter";
        readonly fkField: "leadId";
        readonly entityModel: "lead";
        readonly uniqueConstraint: "leadId_lookupValueId";
    };
    readonly contact: {
        readonly filterModel: "contactFilter";
        readonly fkField: "contactId";
        readonly entityModel: "contact";
        readonly uniqueConstraint: "contactId_lookupValueId";
    };
    readonly raw_contact: {
        readonly filterModel: "rawContactFilter";
        readonly fkField: "rawContactId";
        readonly entityModel: "rawContact";
        readonly uniqueConstraint: "rawContactId_lookupValueId";
    };
    readonly organization: {
        readonly filterModel: "organizationFilter";
        readonly fkField: "organizationId";
        readonly entityModel: "organization";
        readonly uniqueConstraint: "organizationId_lookupValueId";
    };
};
export type EntityType = keyof typeof ENTITY_FILTER_CONFIG;
export declare const VALID_ENTITY_TYPES: EntityType[];
