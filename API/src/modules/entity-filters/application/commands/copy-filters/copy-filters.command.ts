import { EntityType } from '../../../entity-filter.types';

/**
 * Copy all filters from one entity to another.
 * Used when: RawContact → verify → Contact (copy all filters)
 */
export class CopyFiltersCommand {
  constructor(
    public readonly sourceType: EntityType,
    public readonly sourceId: string,
    public readonly targetType: EntityType,
    public readonly targetId: string,
  ) {}
}
