import { EntityType } from '../../../entity-filter.types';
export declare class GetEntityFiltersQuery {
    readonly entityType: EntityType;
    readonly entityId: string;
    constructor(entityType: EntityType, entityId: string);
}
