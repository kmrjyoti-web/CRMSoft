/**
 * Supported entity types for filter assignment.
 * Maps entity type → Prisma model name + FK column.
 */
export const ENTITY_FILTER_CONFIG = {
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
} as const;

export type EntityType = keyof typeof ENTITY_FILTER_CONFIG;
export const VALID_ENTITY_TYPES = Object.keys(ENTITY_FILTER_CONFIG) as EntityType[];
