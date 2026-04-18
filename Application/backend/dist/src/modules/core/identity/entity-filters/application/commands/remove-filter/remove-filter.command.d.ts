import { EntityType } from '../../../entity-filter.types';
export declare class RemoveFilterCommand {
    readonly entityType: EntityType;
    readonly entityId: string;
    readonly lookupValueId: string;
    constructor(entityType: EntityType, entityId: string, lookupValueId: string);
}
