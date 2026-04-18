import { ApiResponse } from '../../../../../common/utils/api-response';
export declare class VendorAiTokensController {
    getUsage(): Promise<ApiResponse<{
        totalTokens: number;
        usedTokens: number;
        remainingTokens: number;
    }>>;
    listTenantUsage(page?: number, limit?: number): Promise<ApiResponse<never[]>>;
    getSettings(): Promise<ApiResponse<{
        enabled: boolean;
        maxTokensPerTenant: number;
        defaultModel: string;
    }>>;
    updateSettings(body: any): Promise<ApiResponse<any>>;
}
