import { EntityType } from '../../../entity-filter.types';

export class ReplaceFiltersCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: string,
    public readonly lookupValueIds: string[],
    public readonly category?: string,
  ) {}
}
