import { EntityType } from '../../../entity-filter.types';

/**
 * Find all entities that have specific filter values.
 * Used for: "Show me all HOT leads from WEBSITE source"
 */
export class GetEntitiesByFilterQuery {
  constructor(
    public readonly entityType: EntityType,
    public readonly lookupValueIds: string[],
    public readonly matchAll?: boolean,
  ) {}
}
