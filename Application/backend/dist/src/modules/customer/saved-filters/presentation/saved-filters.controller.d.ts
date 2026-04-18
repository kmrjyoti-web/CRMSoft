import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiResponse } from '../../../../common/utils/api-response';
import { CreateSavedFilterDto } from './dto/create-saved-filter.dto';
import { UpdateSavedFilterDto } from './dto/update-saved-filter.dto';
import { SavedFilterQueryDto } from './dto/saved-filter-query.dto';
export declare class SavedFiltersController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    list(query: SavedFilterQueryDto, userId: string): Promise<ApiResponse<unknown[]>>;
    getById(id: string): Promise<ApiResponse<any>>;
    create(dto: CreateSavedFilterDto, userId: string): Promise<ApiResponse<any>>;
    update(id: string, dto: UpdateSavedFilterDto, userId: string): Promise<ApiResponse<any>>;
    remove(id: string, userId: string): Promise<ApiResponse<any>>;
}
