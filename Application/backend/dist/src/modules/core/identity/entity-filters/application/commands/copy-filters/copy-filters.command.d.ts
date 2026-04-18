import { EntityType } from '../../../entity-filter.types';
export declare class CopyFiltersCommand {
    readonly sourceType: EntityType;
    readonly sourceId: string;
    readonly targetType: EntityType;
    readonly targetId: string;
    constructor(sourceType: EntityType, sourceId: string, targetType: EntityType, targetId: string);
}
