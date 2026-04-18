import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateLookupDto } from './dto/create-lookup.dto';
import { UpdateLookupDto } from './dto/update-lookup.dto';
import { AddValueDto } from './dto/add-value.dto';
import { UpdateValueDto } from './dto/update-value.dto';
import { ReorderValuesDto } from './dto/reorder-values.dto';
import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class LookupsController {
    private readonly commandBus;
    private readonly queryBus;
    constructor(commandBus: CommandBus, queryBus: QueryBus);
    createLookup(dto: CreateLookupDto): Promise<ApiResponse<any>>;
    getAllLookups(activeOnly?: string): Promise<ApiResponse<any>>;
    getLookupById(id: string): Promise<ApiResponse<any>>;
    updateLookup(id: string, dto: UpdateLookupDto): Promise<ApiResponse<any>>;
    deactivateLookup(id: string): Promise<ApiResponse<null>>;
    getValuesByCategory(category: string): Promise<ApiResponse<any>>;
    addValue(lookupId: string, dto: AddValueDto): Promise<ApiResponse<any>>;
    updateValue(valueId: string, dto: UpdateValueDto): Promise<ApiResponse<null>>;
    reorderValues(lookupId: string, dto: ReorderValuesDto): Promise<ApiResponse<any>>;
    deactivateValue(valueId: string): Promise<ApiResponse<null>>;
    resetToDefaults(): Promise<ApiResponse<any>>;
}
