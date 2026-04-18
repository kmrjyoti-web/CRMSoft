import { EntityType } from '../../../entity-filter.types';
export declare class AssignFiltersCommand {
    readonly entityType: EntityType;
    readonly entityId: string;
    readonly lookupValueIds: string[];
    constructor(entityType: EntityType, entityId: string, lookupValueIds: string[]);
}
