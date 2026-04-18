import { ApiResponse } from '../../../../common/utils/api-response';
import { InventoryLabelService } from '../services/label.service';
import { UpsertLabelDto } from './dto/inventory.dto';
export declare class InventoryLabelsController {
    private readonly labelService;
    constructor(labelService: InventoryLabelService);
    list(): Promise<ApiResponse<{
        id: string;
        industryCode: string;
        serialNoLabel: string;
        code1Label: string | null;
        code2Label: string | null;
        expiryLabel: string | null;
        stockInLabel: string | null;
        stockOutLabel: string | null;
        locationLabel: string | null;
    }[]>>;
    upsert(dto: UpsertLabelDto): Promise<ApiResponse<{
        id: string;
        industryCode: string;
        serialNoLabel: string;
        code1Label: string | null;
        code2Label: string | null;
        expiryLabel: string | null;
        stockInLabel: string | null;
        stockOutLabel: string | null;
        locationLabel: string | null;
    }>>;
}
