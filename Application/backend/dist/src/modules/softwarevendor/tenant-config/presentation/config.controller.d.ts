import { ConfigCategory } from '@prisma/identity-client';
import { ApiResponse } from '../../../../common/utils/api-response';
import { TenantConfigService } from '../services/tenant-config.service';
import { UpdateConfigDto } from './dto/update-config.dto';
import { BulkUpdateConfigDto } from './dto/bulk-update-config.dto';
export declare class ConfigController {
    private readonly configService;
    constructor(configService: TenantConfigService);
    getAll(tenantId: string): Promise<ApiResponse<Record<string, unknown[]>>>;
    getByCategory(tenantId: string, category: ConfigCategory): Promise<ApiResponse<Record<string, unknown[]>>>;
    bulkSet(tenantId: string, userId: string, userName: string, dto: BulkUpdateConfigDto): Promise<ApiResponse<{
        updated: number;
    }>>;
    get(tenantId: string, key: string): Promise<ApiResponse<{
        key: string;
        value: string | null;
    }>>;
    set(tenantId: string, userId: string, userName: string, key: string, dto: UpdateConfigDto): Promise<ApiResponse<null>>;
    resetToDefault(tenantId: string, userId: string, key: string): Promise<ApiResponse<null>>;
}
