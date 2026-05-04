import { EntityType } from '../../../entity-filter.types';

export class GetEntityFiltersQuery {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: string,
  ) {}
}
