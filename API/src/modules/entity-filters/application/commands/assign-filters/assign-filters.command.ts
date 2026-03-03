import { EntityType } from '../../../entity-filter.types';

export class AssignFiltersCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: string,
    public readonly lookupValueIds: string[],
  ) {}
}
