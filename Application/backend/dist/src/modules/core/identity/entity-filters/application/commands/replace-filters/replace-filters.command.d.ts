import { EntityType } from '../../../entity-filter.types';
export declare class ReplaceFiltersCommand {
    readonly entityType: EntityType;
    readonly entityId: string;
    readonly lookupValueIds: string[];
    readonly category?: string | undefined;
    constructor(entityType: EntityType, entityId: string, lookupValueIds: string[], category?: string | undefined);
}
