import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AssignFiltersDto, ReplaceFiltersDto, CopyFiltersDto, FilterSearchDto } from './dto/entity-filter.dto';
import { EntityType } from '../entity-filter.types';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class EntityFiltersController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    getFilters(entityType: EntityType, entityId: string): Promise<ApiResponse<any>>;
    assignFilters(entityType: EntityType, entityId: string, dto: AssignFiltersDto): Promise<ApiResponse<any>>;
    replaceFilters(entityType: EntityType, entityId: string, dto: ReplaceFiltersDto): Promise<ApiResponse<any>>;
    removeFilter(entityType: EntityType, entityId: string, lookupValueId: string): Promise<ApiResponse<null>>;
    copyFilters(entityType: EntityType, entityId: string, dto: CopyFiltersDto): Promise<ApiResponse<{
        copied: any;
    }>>;
}
export declare class FilterSearchController {
    private readonly queryBus;
    constructor(queryBus: QueryBus);
    searchByFilters(entityType: EntityType, dto: FilterSearchDto): Promise<ApiResponse<{
        entityIds: any;
        count: any;
    }>>;
}
