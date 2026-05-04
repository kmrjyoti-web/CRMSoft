import { EntityType } from '../../../entity-filter.types';

export class RemoveFilterCommand {
  constructor(
    public readonly entityType: EntityType,
    public readonly entityId: string,
    public readonly lookupValueId: string,
  ) {}
}
