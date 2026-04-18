import { SmartSearchService } from './smart-search.service';
import { SmartSearchDto } from './dto/smart-search.dto';
import { ApiResponse } from '../../../../common/utils/api-response';
export declare class SmartSearchController {
    private readonly service;
    constructor(service: SmartSearchService);
    search(dto: SmartSearchDto, user: any): Promise<ApiResponse<{
        results: any[];
        total: number;
        limit: number;
        offset: number;
    }>>;
    getParameters(entityType: string): ApiResponse<unknown[]>;
}
