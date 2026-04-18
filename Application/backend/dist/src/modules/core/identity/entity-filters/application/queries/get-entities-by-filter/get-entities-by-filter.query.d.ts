import { EntityType } from '../../../entity-filter.types';
export declare class GetEntitiesByFilterQuery {
    readonly entityType: EntityType;
    readonly lookupValueIds: string[];
    readonly matchAll?: boolean | undefined;
    constructor(entityType: EntityType, lookupValueIds: string[], matchAll?: boolean | undefined);
}
