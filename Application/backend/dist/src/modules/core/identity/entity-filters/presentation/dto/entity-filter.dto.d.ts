import { EntityType } from '../../entity-filter.types';
export declare class AssignFiltersDto {
    lookupValueIds: string[];
}
export declare class ReplaceFiltersDto {
    lookupValueIds: string[];
    category?: string;
}
export declare class CopyFiltersDto {
    targetType: EntityType;
    targetId: string;
}
export declare class FilterSearchDto {
    lookupValueIds: string[];
    matchAll?: boolean;
}
